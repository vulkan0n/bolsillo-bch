import { ExchangeLab, PoolV0, PoolV0Parameters } from "@cashlab/cauldron";
import type { TradeResult } from "@cashlab/cauldron";
import {
  PayoutAmountRuleType,
  PayoutRule,
  SpendableCoin,
  SpendableCoinType,
} from "@cashlab/common";

import LogService from "@/kernel/app/LogService";
import ElectrumService from "@/kernel/bch/ElectrumService";
import AddressManagerService from "@/kernel/wallet/AddressManagerService";
import KeyManagerService from "@/kernel/wallet/KeyManagerService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";
import type { WalletEntity } from "@/kernel/wallet/WalletManagerService";

import { addressToLockingBytecode } from "@/util/cashaddr";
import { binToHex, hexToBin } from "@/util/hex";

const Log = LogService("CauldronService");

// -------- Module-level ExchangeLab singleton --------

const exchangeLab = new ExchangeLab();

// -------- Types --------

export type CauldronPoolUtxo = {
  is_withdrawn: boolean;
  new_utxo_hash: string;
  new_utxo_n: number;
  new_utxo_txid: string;
  pkh: string;
  sats: number;
  token_amount: number;
  token_id: string;
  spent_utxo_hash?: string;
};

// -------- Module-level pool UTXO registry --------

const poolUtxos = new Map<string, CauldronPoolUtxo>();

function registerPool(pool: CauldronPoolUtxo): void {
  if (!pool.new_utxo_hash) return;
  poolUtxos.set(pool.new_utxo_hash, pool);
}

function updatePool(pool: CauldronPoolUtxo): void {
  if (pool.spent_utxo_hash && poolUtxos.has(pool.spent_utxo_hash)) {
    poolUtxos.delete(pool.spent_utxo_hash);
  }
  registerPool(pool);
}

// -------- Pure helpers (exported for testing) --------

export function parsePoolFromRostrumNodeData(
  exlab: ExchangeLab,
  rn_pool: CauldronPoolUtxo
): PoolV0 | null {
  if (rn_pool.is_withdrawn) {
    return null;
  }
  const poolParams: PoolV0Parameters = {
    withdraw_pubkey_hash: hexToBin(rn_pool.pkh),
  };
  const lockingBytecode = exlab.generatePoolV0LockingBytecode(poolParams);
  return {
    version: "0",
    parameters: poolParams,
    outpoint: {
      index: rn_pool.new_utxo_n,
      txhash: hexToBin(rn_pool.new_utxo_txid),
    },
    output: {
      locking_bytecode: lockingBytecode,
      token: {
        amount: BigInt(rn_pool.token_amount),
        token_id: rn_pool.token_id,
      },
      amount: BigInt(rn_pool.sats),
    },
  };
}

export function calcTokenPrice(pools: CauldronPoolUtxo[]): bigint {
  const tokenSum = pools.reduce(
    (sum, cur) => sum + BigInt(cur.token_amount),
    0n
  );
  const satsSum = pools.reduce((sum, cur) => sum + BigInt(cur.sats), 0n);
  if (satsSum === 0n || tokenSum === 0n) {
    return 1n;
  }
  const q = satsSum / tokenSum;
  const r = satsSum % tokenSum;
  // Half-up rounding: multiply remainder by 2 and compare to denominator
  // to avoid bias when remainder equals half of tokenSum
  return r * 2n >= tokenSum ? q + 1n : q;
}

// -------- Service --------

export default function CauldronService() {
  const Rostrum = ElectrumService("cauldron");

  return {
    fetchPools,
    getTokenPrice,
    getPoolInputs,
    prepareTrade,
    broadcastTransaction: (txHex: string) =>
      Rostrum.broadcastTransaction(txHex),
    disconnect,
  };

  // ---------------- Connection ----------------

  async function connect() {
    if (Rostrum.getIsConnected()) return true;
    return Rostrum.connect("", {
      connected: () => {
        Log.log("ROSTRUM CONNECTED", Rostrum.getElectrumHost());
      },
      notification: handleRostrumNotifications,
      disconnected: () => {
        Log.log("ROSTRUM DISCONNECTED");
      },
    });
  }

  function disconnect() {
    poolUtxos.clear();
    return Rostrum.disconnect(true);
  }

  // ---------------- Rostrum notifications ----------------

  function handleRostrumNotifications(data: {
    method?: string;
    params?: unknown;
  }) {
    if (data.method === "cauldron.contract.subscribe") {
      handleCauldronSubscription(data.params);
    }
  }

  function handleCauldronSubscription(params: unknown) {
    // Initial subscription event: [version, category, { utxos: [...] }]
    if (Array.isArray(params)) {
      const subscriptionEvent = params[2] as {
        utxos: CauldronPoolUtxo[];
      };
      if (subscriptionEvent?.utxos) {
        subscriptionEvent.utxos.forEach((utxo) => registerPool(utxo));
      }
      return;
    }
    // Update notification: { type: "update", utxos: [...] }
    const updateEvent = params as {
      type?: string;
      utxos?: CauldronPoolUtxo[];
    };
    if (updateEvent?.type === "update" && updateEvent.utxos) {
      updateEvent.utxos.forEach((utxo) => updatePool(utxo));
    }
  }

  // ---------------- Pool fetching ----------------

  async function fetchPools(category: string): Promise<PoolV0[]> {
    if (!Rostrum.getIsConnected()) {
      await connect();
    }
    const client = Rostrum.getElectrumClient();
    const result = await client.request(
      "cauldron.contract.subscribe",
      2,
      category
    );
    // Clear stale pools for this category only after a successful fetch,
    // so a network failure doesn't wipe the pool registry.
    const staleKeys: string[] = [];
    poolUtxos.forEach((pool, key) => {
      if (pool.token_id === category) {
        staleKeys.push(key);
      }
    });
    staleKeys.forEach((key) => poolUtxos.delete(key));
    handleCauldronSubscription([2, category, result]);
    return getPoolInputs(category);
  }

  function getPoolInputs(category?: string): PoolV0[] {
    return [...poolUtxos.values()]
      .filter((p) => category === undefined || p.token_id === category)
      .map((pool) => parsePoolFromRostrumNodeData(exchangeLab, pool))
      .filter((p): p is PoolV0 => p !== null);
  }

  // ---------------- Price oracle ----------------

  function getTokenPrice(category: string): bigint {
    if (!category) {
      throw new Error("getTokenPrice requires a token category");
    }
    const pools = [...poolUtxos.values()].filter(
      (p) => p.token_id === category
    );
    return calcTokenPrice(pools);
  }

  // ---------------- Trade preparation ----------------

  function prepareTrade(
    supplyCategory: string,
    demandCategory: string,
    amount: bigint,
    wallet: WalletEntity,
    isDemandFlipped = false,
    feeBuffer: bigint = 0n
  ): { tx_hex: string; tradeResult: TradeResult } {
    const inputPools = getPoolInputs();
    const TX_FEE_PER_BYTE = 1n;

    const tradeResult = isDemandFlipped
      ? exchangeLab.constructTradeBestRateForTargetSupply(
          supplyCategory,
          demandCategory,
          amount,
          inputPools,
          TX_FEE_PER_BYTE
        )
      : exchangeLab.constructTradeBestRateForTargetDemand(
          supplyCategory,
          demandCategory,
          amount,
          inputPools,
          TX_FEE_PER_BYTE
        );

    const { walletHash } = wallet;

    const attemptTrade = (fee: bigint) => {
      const AddressManager = AddressManagerService(walletHash);
      const receiveAddress = AddressManager.getUnusedAddresses(1, 0)[0];
      const changeAddress = AddressManager.getUnusedAddresses(1, 1)[0];

      const isDemandToken = supplyCategory === "BCH";
      const demandTokenRule = isDemandToken
        ? {
            token: {
              token_id: demandCategory,
              amount: tradeResult.summary.demand,
            },
            amount: -1n as const,
          }
        : { amount: tradeResult.summary.demand - fee };

      const payoutRules: PayoutRule[] = [
        {
          type: PayoutAmountRuleType.FIXED,
          locking_bytecode: addressToLockingBytecode(receiveAddress.address),
          ...demandTokenRule,
        },
        {
          type: PayoutAmountRuleType.CHANGE,
          locking_bytecode: addressToLockingBytecode(changeAddress.address),
          allow_mixing_native_and_token_when_bch_change_is_dust: true,
        },
      ];

      const UtxoManager = UtxoManagerService(walletHash);
      const KeyManager = KeyManagerService(wallet);

      const supplyInputs = isDemandToken
        ? UtxoManager.selectCoins(tradeResult.summary.supply + fee)
        : [
            ...UtxoManager.selectTokens(
              supplyCategory,
              tradeResult.summary.supply
            ),
            ...UtxoManager.selectCoins(fee),
          ];

      const clabInputs: SpendableCoin[] = supplyInputs.map((input) => ({
        type: SpendableCoinType.P2PKH,
        key: KeyManager.getAddressPrivateKey(input.address),
        output: {
          locking_bytecode: addressToLockingBytecode(input.address),
          token:
            (input.token_amount ?? 0n) > 0n
              ? {
                  amount: input.token_amount,
                  token_id: input.token_category,
                }
              : undefined,
          amount: input.valueSatoshis,
        },
        outpoint: {
          txhash: hexToBin(input.tx_hash),
          index: input.tx_pos,
        },
      }));

      const tradeTx = exchangeLab.createTradeTx(
        tradeResult.entries,
        clabInputs,
        payoutRules,
        null,
        TX_FEE_PER_BYTE
      );
      return tradeTx;
    };

    const tradeTx = attemptTrade(feeBuffer);
    const tx_hex = binToHex(tradeTx.txbin);
    return { tx_hex, tradeResult };
  }
}

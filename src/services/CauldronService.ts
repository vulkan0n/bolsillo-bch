import {
  PayoutRule,
  PayoutAmountRuleType,
  SpendableCoin,
  SpendableCoinType,
} from "@cashlab/common";
import { ExchangeLab, PoolV0, PoolV0Parameters } from "@cashlab/cauldron";
import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import { WalletEntity } from "@/services/WalletManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import HdNodeService from "@/services/HdNodeService";
import { hexToBin, binToHex } from "@/util/hex";
import { addressToLockingBytecode } from "@/util/cashaddr";

const Log = LogService("CauldronService");

export type CauldronPoolUtxo = {
  is_withdrawn: boolean;
  new_utxo_hash: string;
  new_utxo_n: number;
  new_utxo_txid: string;
  pkh: string;
  sats: number;
  spent_utxo_hash: string;
  token_amount: number;
  token_id: string;
};

export const parsePoolFromRostrumNodeData = (
  exlab: ExchangeLab,
  rn_pool: any
): PoolV0 | null => {
  if (rn_pool.is_withdrawn) {
    return null;
  }
  const pool_params: PoolV0Parameters = {
    withdraw_pubkey_hash: hexToBin(rn_pool.pkh),
  };
  const locking_bytecode = exlab.generatePoolV0LockingBytecode(pool_params);
  return {
    version: "0",
    parameters: pool_params,
    outpoint: {
      index: rn_pool.new_utxo_n,
      txhash: hexToBin(rn_pool.new_utxo_txid),
    },
    output: {
      locking_bytecode,
      token: {
        amount: BigInt(rn_pool.token_amount),
        token_id: rn_pool.token_id,
      },
      amount: BigInt(rn_pool.sats),
    },
  };
};

type SubscriptionFunction = (data: any) => void;

export default function CauldronService() {
  const Rostrum = ElectrumService("cauldron");
  const subscriptions = new Map<string, Array<SubscriptionFunction>>();
  const poolUtxos = new Map<string, CauldronPoolUtxo>();

  return {
    connect,
    disconnect,
    subscribe,
    prepareTrade,
    broadcastTransaction: Rostrum.broadcastTransaction,
  };

  function registerPool(pool) {
    poolUtxos.set(pool.new_utxo_hash, pool);
    Log.debug("registerPool", pool, poolUtxos);
  }

  function updatePool(pool) {
    const oldPool = poolUtxos.get(pool.spent_utxo_hash);

    if (oldPool) {
      poolUtxos.delete(pool.spent_utxo_hash);
    }

    registerPool(pool);
  }

  function handleRostrumNotifications(data) {
    if (data.method === "cauldron.contract.subscribe") {
      handleCauldronSubscription(data.params);
    }
  }

  function handleCauldronSubscription(params) {
    Log.debug("handleCauldronSubscription", params);
    if (params.length < 2) {
      Log.warn("ignoring cauldron notification: invalid response length");
      return;
    }

    // "initial" event sends an array
    let tokenId;
    if (Array.isArray(params)) {
      tokenId = params[1];
      const subscriptionEvent = params[2];

      subscriptionEvent.utxos.forEach((utxo) => registerPool(utxo));
    }
    // "update" event is just a plain object, per-utxo
    else if (params.type && params.type === "update") {
      const { utxos } = params;
      utxos.forEach((utxo) => updatePool(utxo));
      tokenId = utxos[0].token_id;
    }

    // notify subscribers with updated utxo list
    const callbacks = subscriptions.get(tokenId) || [];
    Promise.all(callbacks.map((cb) => cb([...poolUtxos.values()])));
  }

  async function connect() {
    if (Rostrum.getIsConnected()) {
      return true;
    }

    // override default ElectrumService listeners with our own
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
    return Rostrum.disconnect(true);
  }

  async function subscribe(category: string, callback: SubscriptionFunction) {
    const currentSubscriptions = subscriptions.get(category) || [];
    subscriptions.set(category, [...currentSubscriptions, callback]);

    const rostrum = Rostrum.getElectrumClient();
    rostrum.subscribe("cauldron.contract.subscribe", 2, category);

    Log.debug("subscribe", category);
  }

  function getPoolInputs(): Array<PoolV0> {
    const exlab = new ExchangeLab();
    Log.log(poolUtxos);
    return [...poolUtxos.values()].map((pool) =>
      parsePoolFromRostrumNodeData(exlab, pool)
    );
  }

  function prepareTrade(
    supplyCategory: string,
    demandCategory: string,
    supplyAmount: bigint,
    demandAmount: bigint,
    wallet: WalletEntity,
    isDemandFlipped: boolean = false
  ) {
    const exchangeLab = new ExchangeLab();

    // get cauldron utxos
    const inputPools = getPoolInputs();
    const TX_FEE_PER_BYTE = 1n;

    if (isDemandFlipped) {
      Log.debug(
        "prepareTrade:",
        supplyCategory,
        "->",
        demandCategory,
        "selling",
        supplyAmount,
        "from",
        inputPools,
        "with",
        demandAmount
      );
    } else {
      Log.debug(
        "prepareTrade:",
        supplyCategory,
        "->",
        demandCategory,
        "buying",
        demandAmount,
        "from",
        inputPools,
        "with",
        supplyAmount
      );
    }

    const tradeResult = isDemandFlipped
      ? exchangeLab.constructTradeBestRateForTargetSupply(
          supplyCategory,
          demandCategory,
          supplyAmount,
          inputPools,
          TX_FEE_PER_BYTE
        )
      : exchangeLab.constructTradeBestRateForTargetDemand(
          supplyCategory,
          demandCategory,
          demandAmount,
          inputPools,
          TX_FEE_PER_BYTE
        );

    Log.debug("prepareTrade", tradeResult);

    const { walletHash } = wallet;

    const AddressManager = AddressManagerService(walletHash);
    const receiveAddress = AddressManager.getUnusedAddresses(1, 0)[0];
    const changeAddress = AddressManager.getUnusedAddresses(1, 1)[0];

    // output demand token
    const isDemandToken = supplyCategory === "BCH";
    const demandTokenRule = isDemandToken
      ? {
          token: { token_id: demandCategory, amount: demandAmount },
          amount: -1n,
        }
      : { amount: demandAmount };

    const payoutRules: PayoutRule[] = [
      // trade payout address
      {
        type: PayoutAmountRuleType.FIXED,
        locking_bytecode: addressToLockingBytecode(receiveAddress.address),
        ...demandTokenRule,
      },
      // all of our change outputs to one address
      {
        type: PayoutAmountRuleType.CHANGE,
        locking_bytecode: addressToLockingBytecode(changeAddress.address),
        allow_mixing_native_and_token_when_bch_change_is_dust: true,
      },
      // cauldron utxo handled by cashlab
    ];

    Log.debug("payoutRules", payoutRules);

    // input supply token
    const UtxoManager = UtxoManagerService(walletHash);
    const HdNode = HdNodeService(wallet);

    let tradeTx;
    let fee = 0n;
    for (let i = 0; i < 5; i += 1) {
      const supplyInputs = isDemandToken
        ? UtxoManager.selectCoins(supplyAmount + fee)
        : [
            ...UtxoManager.selectTokens(supplyCategory, supplyAmount),
            ...UtxoManager.selectCoins(fee),
          ];

      const clabInputs: SpendableCoin[] = supplyInputs.map((input) => {
        return {
          type: SpendableCoinType.P2PKH,
          key: HdNode.getAddressPrivateKey(input.address),
          output: {
            locking_bytecode: addressToLockingBytecode(input.address),
            token:
              input.token_amount > 0
                ? {
                    amount: BigInt(input.token_amount),
                    token_id: input.token_category,
                  }
                : undefined,
            amount: BigInt(input.amount),
          },
          outpoint: {
            txhash: hexToBin(input.txid),
            index: Number(input.tx_pos),
          },
        };
      });

      try {
        tradeTx = exchangeLab.createTradeTx(
          tradeResult.entries,
          clabInputs,
          payoutRules,
          null,
          TX_FEE_PER_BYTE
        );
        Log.debug("tradeTx", tradeTx);
        break;
      } catch (e) {
        if (e.required_amount) {
          fee += e.required_amount;
        } else {
          throw e;
        }
      }
    }

    const tx_hex = binToHex(tradeTx.txbin);
    return tx_hex;
  }
}

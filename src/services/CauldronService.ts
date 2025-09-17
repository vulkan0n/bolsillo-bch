import { Exception } from "@cashlab/common";
import { ExchangeLab, PoolV0 } from "@cashlab/cauldron";
import { hashTransactionUiOrder } from "@bitauth/libauth";
import ElectrumService from "@/services/ElectrumService";
import LogService from "@/services/LogService";
import { deferredPromise } from "@/util/promise_helpers";
import { hexToBin, binToHex } from "@/util/hex";
import { MUSD_TOKENID } from "@/util/tokens";

const Log = LogService("CauldronService");

export type RostrumCauldronContractSubscribeEvent = {
  type: string;
  utxos: Array<{
    is_withdrawn: boolean;
    new_utxo_hash: string;
    new_utxo_n: number;
    new_utxo_txid: string;
    pkh: string;
    sats: number;
    spent_utxo_hash: string;
    token_amount: number;
    token_id: string;
  }>;
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
  const pools = new Map();

  return {
    connect,
    disconnect,
    subscribe,
    prepareTrade,
  };

  function registerPool(pool) {
    pools.set(pool.new_utxo_hash, pool);
    Log.debug("registerPool", pool);
  }

  function updatePool(pool) {
    const oldPool = pools.get(pool.spent_utxo_hash);

    if (oldPool) {
      pools.delete(pool.spent_utxo_hash);
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
    Promise.all(callbacks.map((cb) => cb([...pools.values()])));
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
}

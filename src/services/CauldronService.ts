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

const CAULDRONS = new Map<string, typeof CauldronService>();

export default function CauldronService() {
  const Rostrum = ElectrumService("cauldron");

  return {
    connect,
    getCauldrons,
  };

  function handleRostrumNotifications(data) {
    if (data.method === "cauldron.contract.subscribe") {
      handleCauldronSubscription(data.params);
    }
  }

  function handleCauldronSubscription(params) {
    Log.debug("handleCauldronSubscribe", params);
    if (params.length < 2) {
      Log.warn("ignoring cauldron notification: invalid response length");
      return;
    }

    const [, tokenId, event] = params;
    CAULDRONS.set(tokenId, event.utxos);
  }

  async function connect() {
    if (Rostrum.getIsConnected()) {
      return true;
    }

    return Rostrum.connect("", {
      connected: () => {
        Log.log("ROSTRUM CONNECTED", Rostrum.getElectrumHost());
        const rostrum = Rostrum.getElectrumClient();
        rostrum.subscribe("cauldron.contract.subscribe", 2, MUSD_TOKENID);
      },
      notification: handleRostrumNotifications,
    });
  }

  function getCauldrons(category) {
    return CAULDRONS.get(category) || [];
  }
}

/*
function handleInitialPools(
  entry,
  event: RostrumCauldronContractSubscribeEvent
): void {
  const pools: PoolV0[] = [];
  const exlab = new ExchangeLab();
  for (const utxo of event.utxos) {
    const pool = parsePoolFromRostrumNodeData(exlab, utxo);
    if (pool) {
      poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
      pools.push(pool);
    }
  }
  entry.data = pools;
  this.dispatchEvent(
    new MessageEvent("init-pools", {
      data: { category: entry.category, pools },
    })
  );
  this.dispatchEvent(
    new MessageEvent("update", { data: { category: entry.category } })
  );
}

function handlePoolUpdate(event: RostrumCauldronContractSubscribeEvent): void {
  const updatedCategorySet: Set<string> = new Set();
  let cachedEntry: PoolTrackerEntry | null = null;
  for (const utxo of event.utxos) {
    if (utxo.token_id) {
      let entry: PoolTrackerEntry | undefined;
      if (cachedEntry && cachedEntry.category === utxo.token_id) {
        entry = cachedEntry;
      } else {
        entry = this.getTokenTrackerEntry(utxo.token_id);
        if (!entry) continue;
        cachedEntry = entry;
      }
      if (poolHashMap.has(utxo.new_utxo_hash)) continue;
      const pool = parsePoolFromRostrumNodeData(exlab, utxo);
      if (!pool) {
        throw new Error(
          `Failed to parse pool: ${JSON.stringify(utxo, null, "  ")}`
        );
      }
      const existingPoolRef = poolHashMap.get(utxo.spent_utxo_hash);
      if (existingPoolRef) {
        existingPoolRef.pool.outpoint = pool.outpoint;
        existingPoolRef.pool.output = pool.output;
        poolHashMap.set(utxo.new_utxo_hash, {
          pool: existingPoolRef.pool,
          entry,
        });
      } else {
        if (!entry.data) throw new Error("entry.data is null");
        entry.data.push(pool);
        poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
      }
      poolHashMap.delete(utxo.spent_utxo_hash);
      updatedCategorySet.add(entry.category);
    } else {
      const poolRef = poolHashMap.get(utxo.spent_utxo_hash);
      if (poolRef) {
        const { entry, pool } = poolRef;
        if (!entry.data) throw new Error("entry.data is null");
        const idx = entry.data.indexOf(pool);
        if (idx !== -1) entry.data.splice(idx, 1);
        poolHashMap.delete(utxo.spent_utxo_hash);
        updatedCategorySet.add(entry.category);
      }
    }
  }
  for (const category of updatedCategorySet) {
    this.dispatchEvent(new MessageEvent("update", { data: { category } }));
  }
}

async function removeEntry(entry: PoolTrackerEntry): Promise<void> {
  const idx = entries.indexOf(entry);
  if (idx === -1) {
    throw new Error("The entry is not registered");
  }
  entries.splice(idx, 1);
  for (const [utxoHash, poolRef] of poolHashMap.entries()) {
    if (poolRef.entry === entry) {
      poolHashMap.delete(utxoHash);
    }
  }
  entry.data = null;
  const client = this.clientManager.getClient();
  if (client && entry.activeSub) {
    try {
      await client.unsubscribe(
        "cauldron.contract.subscribe",
        2,
        entry.category
      );
    } catch (err) {
      this.dispatchConsoleEvent(
        "warn",
        "unsubscribe cauldron.contract.subscribe failed",
        err
      );
    } finally {
      entry.pendingRequest = null;
    }
  }
}

function getTokenTrackerEntry(category: string): PoolTrackerEntry | undefined {
  return entries.find((e) => e.category === category);
}

async function initEntry(
  client: ElectrumClient<ElectrumClientEvents>,
  entry: PoolTrackerEntry
): Promise<void> {
  if (this.destroyed) {
    throw new Exception("service is destroyed");
  }
  const { promise: pendingPromise, resolve, reject } = deferredPromise<void>();
  entry.error = null;
  entry.pendingRequest = pendingPromise;

  const onInitPools = (event: MessageEvent) => {
    if (event.data.category === entry.category) {
      clear();
      entry.activeSub = true;
      resolve();
    }
  };

  async function addTokenTracker(category: string): Promise<PoolTrackerEntry> {
    let entry = this.getTokenTrackerEntry(category);
    if (entry) return entry;
    entry = {
      category,
      data: null,
      pendingRequest: null,
      error: null,
      activeSub: false,
      nouseAutoRemove: false,
    };
    entries.push(entry);
    const client = this.clientManager.getClient();
    if (client) {
      await this.initEntry(client, entry);
    }
    return entry;
  }

  async function getTokenPools(category: string): Promise<PoolV0[]> {
    let entry = this.getTokenTrackerEntry(category);
    if (!entry) {
      entry = await this.addTokenTracker(category);
      entry.nouseAutoRemove = true;
      entry.nouseTimeoutDuration = 10 * 60 * 1000;
      entry.nouseTimeoutId = setTimeout(
        () => this.removeEntry(entry),
        entry.nouseTimeoutDuration!
      );
    }
    this.onEntryUsed(entry);
    if (entry.pendingRequest) await entry.pendingRequest;
    if (!entry.data) {
      const client = this.clientManager.getClient();
      if (client) {
        if (entry.activeSub) {
          throw new Error("entry.activeSub is true while entry.data is null");
        }
        await this.initEntry(client, entry);
        if (entry.error) throw entry.error;
        if (!entry.data) throw new Error("entry.data should not be null");
      } else {
        throw new Error(entry.error || "Unknown error");
      }
    }
    return entry.data;
  }

  function getTrackerEntries(): PoolTrackerEntry[] {
    return entries;
  }
}
*/

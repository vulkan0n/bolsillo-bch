import ElectrumClientManager, { ServerInfo } from "@/util/electrum_client_manager.js";
import { deferredPromise } from "@/util/promise_helpers.ts";
import { hexToBin, binToHex } from "@/util/hex";
import { cauldron_rostrum_servers } from "@/util/electrum_servers";
import { TokenId } from "@cashlab/common";
import { ExchangeLab, PoolV0, TradeResult } from "@cashlab/cauldron";
import { store } from "@/redux";
import { selectBchNetwork } from "@/redux/preferences";
import { Exception } from "@cashlab/common";
import { hashTransactionUiOrder } from '@cashlab/common/libauth.js';
import type { ElectrumClient, ElectrumClientEvents, RPCNotification as ElectrumRPCNotification } from '@electrum-cash/network';

export type PoolTrackerEntry = {
  category: string;
  data: PoolV0[] | null;
  pendingRequest: Promise<any> | null;
  error: any;
  activeSub: boolean;
  nouseAutoRemove: boolean;
  nouseTimeoutDuration?: number;
  nouseTimeoutId?: TimeoutId;
};

export type RostrumCauldronContractSubscribeEvent = {
  type: string,
  utxos: Array<{
    is_withdrawn: boolean,
    new_utxo_hash: string,
    new_utxo_n: number,
    new_utxo_txid: string,
    pkh: string;
    sats: number,
    spent_utxo_hash: string;
    token_amount: number,
    token_id: string;
  }>;
};

export const parsePoolFromRostrumNodeData = (exlab: ExchangeLab, rn_pool: any): PoolV0 | null => {
  if (rn_pool.is_withdrawn) {
    return null
  }
  const pool_params: PoolV0Parameters = {
    withdraw_pubkey_hash: hexToBin(rn_pool.pkh),
  };
  // reconstruct pool's locking bytecode
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

export class OperationInterrupted extends Exception {
}

export class CauldronDexClient extends EventTarget {
  clientManager: ElectrumClientManager;
  entries: PoolTrackerEntry[];
  poolHashMap: Map<string, { pool: PoolV0, entry: PoolTrackerEntry }>;
  exlab: ExchangeLab;
  destroyed: boolean;
  constructor (clientManager: ElectrumClientManager) {
    super();
    this.exlab = new ExchangeLab();
    this.clientManager = clientManager;
    this.entries = [];
    this.poolHashMap = new Map();
    this.destroyed = false;
  }
  async init () {
    (this as any)._onConnected = this.onConnected.bind(this);
    (this as any)._onDisconnected = this.onDisconnected.bind(this);
    (this as any)._onElectrumNotification = this.onElectrumNotification.bind(this);
    this.clientManager.addEventListener("connected", (this as any)._onConnected);
    this.clientManager.addEventListener("disconnected", (this as any)._onDisconnected);
    this.clientManager.addEventListener("notification", (this as any)._onElectrumNotification);
  }
  async destroy () {
    this.destroyed = true;
    if (this.clientManager != null) {
      this.clientManager.removeEventListener("connected", (this as any)._onConnected);
      this.clientManager.removeEventListener("disconnected", (this as any)._onDisconnected);
      this.clientManager.removeEventListener("notification", (this as any)._onElectrumNotification);
    }
    this.dispatchEvent(new Event("destroy"));
    await Promise.all(this.entries.map((entry) => this.removeEntry(entry)));
    this.poolHashMap = new Map();
  }
  getElectrumClientManager (): ElectrumClientManager {
    return this.clientManager;
  }
  getExchangeLab (): ExchangeLab {
    return this.exlab;
  }
  onConnected (): void {
    if (this.clientManager == null) {
      throw new Error("client manager is not defined!");
    }
    const client = this.clientManager.getClient();
    if (client == null) {
      throw new Error("onConnected, client should not be null!");
    }
    for (const entry of this.entries) {
      this.initEntry(client, entry);
    }
  }
  onDisconnected (): void {
    if (this.clientManager == null) {
      throw new Error("client manager is not defined!");
    }
    for (const entry of this.entries) {
      entry.activeSub = false;
      entry.pendingRequest = null;
    }
  }
  onElectrumNotification (input: MessageEvent): void {
    const message: ElectrumRPCNotification = input.data;
    if (this.clientManager == null) {
      throw new Error("client manager is not defined!");
    }
    const client = this.clientManager.getClient();
    if (client == null) {
      throw new Error("client is null!!");
    }
    switch (message.method) {
      case "cauldron.contract.subscribe": {
        if (message.params != null && message.params[0] == 2 && message.params[1]) {
          const entry = this.getTokenTrackerEntry(message.params[1] as string);
          if (entry == null) {
            return; // ignore
          }
          const event: RostrumCauldronContractSubscribeEvent = message.params[2] as any;
          if (event.type == "initial") {
            const pools: PoolV0[] = []
            for (const utxo of event.utxos) {
              const pool = parsePoolFromRostrumNodeData(this.exlab, utxo);
              if (pool != null) {
                this.poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
                pools.push(pool);
              }
            }
            entry.data = pools;
            this.dispatchEvent(new MessageEvent("init-pools", { data: { category: entry.category, pools } }));
            this.dispatchEvent(new MessageEvent("update", { data: { category: entry.category } }));
          } else {
            this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: "Unknown event type from (1) cauldron.contract.subscribe", data: event } }));
          }
        } else if (message.params != null && (message.params as any).type != null) {
          const event: RostrumCauldronContractSubscribeEvent = message.params as any;
          if (event.type == "update") {
            const updatedCategorySet: Set<string> = new Set();;
            let cachedEntry: PoolTrackerEntry | null = null;
            for (const utxo of event.utxos) {
              if (utxo.token_id != null) {
                let entry;
                if (cachedEntry && cachedEntry.category == utxo.token_id) {
                  entry = cachedEntry;
                } else {
                  entry = this.entries.find((a) => a.category == utxo.token_id);
                  if (entry == null) {
                    continue; // ignore
                  }
                  cachedEntry = entry;
                }
                if (this.poolHashMap.has(utxo.new_utxo_hash)) {
                  continue; // already processed
                }
                const pool = parsePoolFromRostrumNodeData(this.exlab, utxo);
                if (pool == null) {
                  throw new Error("Failed to parse a pool: " + JSON.stringify(utxo, null, "  "));
                }
                const existingPoolRef = this.poolHashMap.get(utxo.spent_utxo_hash);
                if (existingPoolRef) {
                  // update
                  const existingPool = existingPoolRef.pool;
                  existingPool.outpoint = pool.outpoint;
                  existingPool.output = pool.output;
                  this.poolHashMap.set(utxo.new_utxo_hash, { pool: existingPool, entry });
                } else {
                  // add
                  if (entry.data == null) {
                    throw new Error("entry.data is null!");
                  }
                  entry.data.push(pool);
                  this.poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
                }
                this.poolHashMap.delete(utxo.spent_utxo_hash);
                updatedCategorySet.add(entry.category);
              } else {
                // delete
                const poolRef = this.poolHashMap.get(utxo.spent_utxo_hash);
                if (poolRef != null) {
                  // delete
                  const { entry, pool } = poolRef;
                  if (entry.data == null) {
                    throw new Error("entry.data is null!");
                  }
                  const idx = entry.data.indexOf(pool);
                  if (idx != -1) {
                    entry.data.splice(idx, 1);
                  }
                  this.poolHashMap.delete(utxo.spent_utxo_hash);
                  updatedCategorySet.add(entry.category);
                }
              }
            }
            for (const category of updatedCategorySet) {
              this.dispatchEvent(new MessageEvent("update", { data: { category } }));
            }
          } else {
            this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: "Unknown event type from (2) cauldron.contract.subscribe", data: event } }));
          }
        } else {
          this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: "Unexpected data from cauldron.contract.subscribe", data: message } }));
        }
        break;
      }
    }
  }
  async initEntry (client: ElectrumClient<ElectrumClientEvents>, entry: PoolTrackerEntry): Promise<void> {
    if (this.destroyed) {
      throw new Exception("service is destroyed");
    }
    const { promise: pendingPromise, resolve, reject } = await deferredPromise<void>();
    entry.error = null;
    entry.pendingRequest = pendingPromise;
    ;(async () => {
      const onResolve = () => {
        entry.pendingRequest = null;
        resolve();
      };
      const onReject = (exc) => {
        entry.pendingRequest = null;
        reject(exc);
      };
      try {
        const clear = () => {
          this.removeEventListener("init-pools", onInitPools);
          this.removeEventListener("disconnected", onDisconnected);
          this.removeEventListener("destroy", onDestroy);
        };
        const onInitPools = (event) => {
          const category: string = event.data.category;
          if (entry.category == category) {
            clear();
            entry.activeSub = true;
            onResolve();
          }
        };
        const onDisconnected = () => {
          clear();
          onResolve();
        };
        const onDestroy = () => {
          clear();
          onReject(new OperationInterrupted());
        };
        this.addEventListener("init-pools", onInitPools);
        this.addEventListener("disconnected", onDisconnected);
        this.addEventListener("destroy", onDestroy);
        await client.subscribe("cauldron.contract.subscribe", 2, entry.category);
      } catch (err) {
        if (entry.pendingRequest != pendingPromise) {
          await entry.pendingRequest;
          onResolve();
          return; // exit
        }
        entry.error = err;
        entry.data = null;
        onResolve();
      }
    })();
    await pendingPromise;
  }
  async removeEntry (entry: PoolTrackerEntry): Promise<void> {
    const idx = this.entries.indexOf(entry);
    if (idx == -1) {
      throw new Error("The entry is not registered");
    }
    this.entries.splice(idx, 1);
    for (const [ utxoHash, poolRef ] of this.poolHashMap.entries()) {
      if (poolRef.entry == entry) {
        this.poolHashMap.delete(utxoHash);
      }
    }
    entry.data = null;
    let pendingPromise;
    if (this.clientManager != null) {
      const client = this.clientManager.getClient();
      if (client != null) {
        try {
          await entry.pendingRequest;
        } catch (err) {
          // pass
        }
        if (entry.activeSub) {
          const pendingPromise = entry.pendingRequest = (async () => {
            try {
              await client.unsubscribe("cauldron.contract.subscribe", 2, entry.category);
            } catch (err) {
              this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: "unsubscribe blockchain.address failed", error: err } }));
            } finally {
              entry.pendingRequest = null;
            }
          })();
          await pendingPromise;
        }
      }
    }
  }
  async addTokenTracker (category: string): Promise<PoolTrackerEntry> {
    if (this.clientManager == null) {
      throw new Error("client manager is not defined!");
    }
    let entry = this.getTokenTrackerEntry(category);
    if (entry != null) {
      return entry;
    }
    entry = {
      category,
      data: null,
      pendingRequest: null,
      error: null,
      activeSub: false,
      nouseAutoRemove: false,
    };
    this.entries.push(entry);
    const client = this.clientManager.getClient();
    if (client != null) {
      await this.initEntry(client, entry);
    }
    return entry;
  }
  getTokenTrackerEntry (category: string): PoolTrackerEntry | undefined {
    return this.entries.find((a) => a.category == category);
  }
  getTrackerEntries (): PoolTrackerEntry[] {
    return this.entries;
  }
  async getEntryPools (entry: PoolTrackerEntry): Promise<PoolV0[]> {
    if (this.destroyed) {
      throw new Exception("service is destroyed");
    }
    if (this.clientManager == null) {
      throw new Error("client manager is not defined!");
    }
    if (this.entries.indexOf(entry) == -1) {
      throw new Error("The entry is not registered");
    }
    if (entry.pendingRequest != null) {
      await entry.pendingRequest;
    }
    if (entry.data == null) {
      const client = this.clientManager.getClient();
      if (client != null) {
        this.onEntryUsed(entry);
        if (entry.activeSub) {
          throw new Error("entry.activeSub is true while entry.data is null");
        }
        await this.initEntry(client, entry);
        if (entry.error != null) {
          throw entry.error;
        }
        if (entry.data == null) {
          throw new Error("entry.data should not be null!!");
        }
        return entry.data;
      } else {
        throw new Error(entry.error || "Unknown error!");
      }
    } else {
      this.onEntryUsed(entry);
      return entry.data;
    }
  }
  onEntryUsed (entry: PoolTrackerEntry): void {
    if (entry.nouseAutoRemove) {
      if (entry.nouseTimeoutId != null) {
        clearTimeout(entry.nouseTimeoutId);
      }
      entry.nouseTimeoutDuration = 10 * 60 * 1000;
      entry.nouseTimeoutId = setTimeout(() => {
        this.removeEntry(entry);
      }, entry.nouseTimeoutDuration);
    }
  }
  async getTokenPools (category: string): Promise<PoolV0[]> {
    let entry = this.getTokenTrackerEntry(category);
    if (entry == null) {
      entry = await this.addTokenTracker(category);
      entry.nouseAutoRemove = true;
    }
    return await this.getEntryPools(entry);
  }
  async broadcastTransaction (txbin: Uint8Array): Promise<{ txhash: string }>  {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.clientManager == null) {
          throw new Error("client manager is not defined!");
        }
        const client = this.clientManager.getClient();
        if (client == null) {
          throw new Error("onConnected, client should not be null!");
        }
        const txhex = binToHex(txbin);
        const txhash = binToHex(hashTransactionUiOrder(txbin));
        const result = await client.request('blockchain.transaction.broadcast', txhex);
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve({ txhash });
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default function CauldronDexService () {
  return {
    createCauldronRostrumClientManager (serversInfo?: ServerInfo[] = undefined): ElectrumClientManager {
      if (serversInfo == null) {
        serversInfo = [];
        const bchNetwork = selectBchNetwork(store.getState());
        for (const urlstr of cauldron_rostrum_servers[bchNetwork]) {
          const url = new URL(urlstr);
          if (["wss:","ws:"].indexOf(url.protocol) == -1 || isNaN(parseInt(url.port||"443"))) {
            throw new Error("Expecting electrum server to be a valid websocket url, got: " + url);
          }
          serversInfo.push({
            host: url.hostname,
            port: parseInt(url.port||"443"),
            encrypted: url.protocol == "wss:",
          });
        }
      }
      return new ElectrumClientManager("cauldron-rostrum", "1.4.3", serversInfo);
    },
    create (clientManager: ElectrumClientManager): CauldronDexClient {
      return new CauldronDexClient(clientManager);
    },
  };
}


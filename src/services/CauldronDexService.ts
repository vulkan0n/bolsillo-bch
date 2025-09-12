import LogService from "@/services/LogService";
import { Exception } from "@cashlab/common";
import { ExchangeLab, PoolV0 } from "@cashlab/cauldron";
import { hashTransactionUiOrder } from "@bitauth/libauth";
import type {
  ElectrumClient,
  ElectrumClientEvents,
  RPCNotification as ElectrumRPCNotification,
} from "@electrum-cash/network";
import ElectrumClientManager, {
  ServerInfo,
} from "@/util/electrum_client_manager";
import { deferredPromise } from "@/util/promise_helpers";
import { hexToBin, binToHex } from "@/util/hex";
import { cauldron_rostrum_servers } from "@/util/electrum_servers";
import { store } from "@/redux";
import { selectBchNetwork } from "@/redux/preferences";

const Log = LogService("CauldronDex");

export type PoolTrackerEntry = {
  category: string;
  data: PoolV0[] | null;
  pendingRequest: Promise<unknown> | null;
  error: unknown;
  activeSub: boolean;
  nouseAutoRemove: boolean;
  nouseTimeoutDuration?: number;
  nouseTimeoutId?: NodeJS.Timeout;
};

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

export default function CauldronDexService() {
  return {
    createCauldronRostrumClientManager,
    createClient,
    getExchangeLab,
    addTokenTracker,
    getTokenPools,
    getTrackerEntries,
    broadcastTransaction,
  };

  function createCauldronRostrumClientManager(
    serversInfo?: ServerInfo[]
  ): ElectrumClientManager {
    if (!serversInfo) {
      serversInfo = [];
      const bchNetwork = selectBchNetwork(store.getState());
      for (const urlstr of cauldron_rostrum_servers[bchNetwork]) {
        const url = new URL(urlstr);
        if (
          !["wss:", "ws:"].includes(url.protocol) ||
          isNaN(parseInt(url.port || "443"))
        ) {
          throw new Error(`Invalid WebSocket URL: ${urlstr}`);
        }
        serversInfo.push({
          host: url.hostname,
          port: parseInt(url.port || "443"),
          encrypted: url.protocol === "wss:",
        });
      }
    }
    return new ElectrumClientManager("cauldron-rostrum", "1.4.3", serversInfo);
  }

  function createClient(manager: ElectrumClientManager): CauldronDexClient {
    return new CauldronDexClient(manager);
  }

  function getExchangeLab(): ExchangeLab {
    return new ExchangeLab();
  }

  async function addTokenTracker(category: string): Promise<PoolTrackerEntry> {
    const client = createClient(createCauldronRostrumClientManager());
    await client.init();
    return client.addTokenTracker(category);
  }

  async function getTokenPools(category: string): Promise<PoolV0[]> {
    const client = createClient(createCauldronRostrumClientManager());
    await client.init();
    return client.getTokenPools(category);
  }

  function getTrackerEntries(client: CauldronDexClient): PoolTrackerEntry[] {
    return client.getTrackerEntries();
  }

  async function broadcastTransaction(
    client: CauldronDexClient,
    txbin: Uint8Array
  ): Promise<{ txhash: string }> {
    return client.broadcastTransaction(txbin);
  }
}

class CauldronDexClient extends EventTarget {
  private clientManager: ElectrumClientManager;
  private entries: PoolTrackerEntry[] = [];
  private poolHashMap: Map<string, { pool: PoolV0; entry: PoolTrackerEntry }> =
    new Map();
  private exlab: ExchangeLab;
  private destroyed: boolean = false;

  constructor(clientManager: ElectrumClientManager) {
    super();
    this.clientManager = clientManager;
    this.exlab = new ExchangeLab();
  }

  async init(): Promise<void> {
    this.clientManager.addEventListener(
      "connected",
      this.onConnected.bind(this)
    );
    this.clientManager.addEventListener(
      "disconnected",
      this.onDisconnected.bind(this)
    );
    this.clientManager.addEventListener(
      "notification",
      this.onElectrumNotification.bind(this)
    );
    Log.debug("Initialized CauldronDexClient");
  }

  async destroy(): Promise<void> {
    this.destroyed = true;
    this.clientManager.removeEventListener(
      "connected",
      this.onConnected.bind(this)
    );
    this.clientManager.removeEventListener(
      "disconnected",
      this.onDisconnected.bind(this)
    );
    this.clientManager.removeEventListener(
      "notification",
      this.onElectrumNotification.bind(this)
    );
    await Promise.all(this.entries.map((entry) => this.removeEntry(entry)));
    this.poolHashMap.clear();
    this.dispatchEvent(new Event("destroy"));
    Log.debug("Destroyed CauldronDexClient");
  }

  getElectrumClientManager(): ElectrumClientManager {
    return this.clientManager;
  }

  getExchangeLab(): ExchangeLab {
    return this.exlab;
  }

  getTrackerEntries(): PoolTrackerEntry[] {
    return this.entries;
  }

  private onConnected(): void {
    const client = this.clientManager.getClient();
    if (!client) {
      throw new Error("Client is null on connected event");
    }
    for (const entry of this.entries) {
      this.initEntry(client, entry).catch((err) =>
        Log.error("Error initializing entry:", err)
      );
    }
  }

  private onDisconnected(): void {
    for (const entry of this.entries) {
      entry.activeSub = false;
      entry.pendingRequest = null;
    }
  }

  private onElectrumNotification(input: MessageEvent): void {
    const message: ElectrumRPCNotification = input.data;
    if (message.method === "cauldron.contract.subscribe") {
      this.handleCauldronSubscribe(message);
    }
  }

  private handleCauldronSubscribe(message: ElectrumRPCNotification): void {
    if (message.params?.[0] === 2 && message.params[1]) {
      const entry = this.getTokenTrackerEntry(message.params[1] as string);
      if (!entry) return;
      const event = message.params[2] as RostrumCauldronContractSubscribeEvent;
      if (event.type === "initial") {
        this.handleInitialPools(entry, event);
      } else {
        this.dispatchConsoleEvent(
          "warn",
          "Unknown event type from cauldron.contract.subscribe (1)",
          event
        );
      }
    } else if (message.params && (message.params as any).type) {
      const event = message.params as RostrumCauldronContractSubscribeEvent;
      if (event.type === "update") {
        this.handlePoolUpdate(event);
      } else {
        this.dispatchConsoleEvent(
          "warn",
          "Unknown event type from cauldron.contract.subscribe (2)",
          event
        );
      }
    } else {
      this.dispatchConsoleEvent(
        "warn",
        "Unexpected data from cauldron.contract.subscribe",
        message
      );
    }
  }

  private handleInitialPools(
    entry: PoolTrackerEntry,
    event: RostrumCauldronContractSubscribeEvent
  ): void {
    const pools: PoolV0[] = [];
    for (const utxo of event.utxos) {
      const pool = parsePoolFromRostrumNodeData(this.exlab, utxo);
      if (pool) {
        this.poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
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

  private handlePoolUpdate(event: RostrumCauldronContractSubscribeEvent): void {
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
        if (this.poolHashMap.has(utxo.new_utxo_hash)) continue;
        const pool = parsePoolFromRostrumNodeData(this.exlab, utxo);
        if (!pool) {
          throw new Error(
            `Failed to parse pool: ${JSON.stringify(utxo, null, "  ")}`
          );
        }
        const existingPoolRef = this.poolHashMap.get(utxo.spent_utxo_hash);
        if (existingPoolRef) {
          existingPoolRef.pool.outpoint = pool.outpoint;
          existingPoolRef.pool.output = pool.output;
          this.poolHashMap.set(utxo.new_utxo_hash, {
            pool: existingPoolRef.pool,
            entry,
          });
        } else {
          if (!entry.data) throw new Error("entry.data is null");
          entry.data.push(pool);
          this.poolHashMap.set(utxo.new_utxo_hash, { pool, entry });
        }
        this.poolHashMap.delete(utxo.spent_utxo_hash);
        updatedCategorySet.add(entry.category);
      } else {
        const poolRef = this.poolHashMap.get(utxo.spent_utxo_hash);
        if (poolRef) {
          const { entry, pool } = poolRef;
          if (!entry.data) throw new Error("entry.data is null");
          const idx = entry.data.indexOf(pool);
          if (idx !== -1) entry.data.splice(idx, 1);
          this.poolHashMap.delete(utxo.spent_utxo_hash);
          updatedCategorySet.add(entry.category);
        }
      }
    }
    for (const category of updatedCategorySet) {
      this.dispatchEvent(new MessageEvent("update", { data: { category } }));
    }
  }

  private dispatchConsoleEvent(type: string, message: string, data: any): void {
    this.dispatchEvent(
      new MessageEvent("console", { data: { type, message, data } })
    );
  }

  private async initEntry(
    client: ElectrumClient<ElectrumClientEvents>,
    entry: PoolTrackerEntry
  ): Promise<void> {
    if (this.destroyed) {
      throw new Exception("service is destroyed");
    }
    const {
      promise: pendingPromise,
      resolve,
      reject,
    } = deferredPromise<void>();
    entry.error = null;
    entry.pendingRequest = pendingPromise;

    const clear = () => {
      this.removeEventListener("init-pools", onInitPools);
      this.removeEventListener("disconnected", onDisconnected);
      this.removeEventListener("destroy", onDestroy);
    };

    const onInitPools = (event: MessageEvent) => {
      if (event.data.category === entry.category) {
        clear();
        entry.activeSub = true;
        resolve();
      }
    };

    const onDisconnected = () => {
      clear();
      resolve();
    };

    const onDestroy = () => {
      clear();
      reject(new Exception("OperationInterrupted"));
    };

    this.addEventListener("init-pools", onInitPools);
    this.addEventListener("disconnected", onDisconnected);
    this.addEventListener("destroy", onDestroy);

    try {
      await client.subscribe("cauldron.contract.subscribe", 2, entry.category);
    } catch (err) {
      if (entry.pendingRequest !== pendingPromise) {
        await entry.pendingRequest;
        resolve();
        return;
      }
      entry.error = err;
      entry.data = null;
      resolve();
    }
    await pendingPromise;
  }

  private async removeEntry(entry: PoolTrackerEntry): Promise<void> {
    const idx = this.entries.indexOf(entry);
    if (idx === -1) {
      throw new Error("The entry is not registered");
    }
    this.entries.splice(idx, 1);
    for (const [utxoHash, poolRef] of this.poolHashMap.entries()) {
      if (poolRef.entry === entry) {
        this.poolHashMap.delete(utxoHash);
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

  async addTokenTracker(category: string): Promise<PoolTrackerEntry> {
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
    this.entries.push(entry);
    const client = this.clientManager.getClient();
    if (client) {
      await this.initEntry(client, entry);
    }
    return entry;
  }

  private getTokenTrackerEntry(category: string): PoolTrackerEntry | undefined {
    return this.entries.find((e) => e.category === category);
  }

  async getTokenPools(category: string): Promise<PoolV0[]> {
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

  private onEntryUsed(entry: PoolTrackerEntry): void {
    if (entry.nouseAutoRemove) {
      if (entry.nouseTimeoutId) clearTimeout(entry.nouseTimeoutId);
      entry.nouseTimeoutDuration = 10 * 60 * 1000;
      entry.nouseTimeoutId = setTimeout(
        () => this.removeEntry(entry),
        entry.nouseTimeoutDuration
      );
    }
  }

  async broadcastTransaction(txbin: Uint8Array): Promise<{ txhash: string }> {
    const client = this.clientManager.getClient();
    if (!client) {
      throw new Error("Client not connected");
    }
    const txhex = binToHex(txbin);
    const txhash = binToHex(hashTransactionUiOrder(txbin));
    const result = await client.request(
      "blockchain.transaction.broadcast",
      txhex
    );
    if (result instanceof Error) {
      throw result;
    }
    return { txhash };
  }
}

/* eslint-disable max-classes-per-file */
import {
  ElectrumClient,
  ConnectionStatus,
  ElectrumClientEvents,
} from "@electrum-cash/network";
import { ElectrumWebSocket } from "@electrum-cash/web-socket";
import { store } from "@/redux";
import { setPreference } from "@/redux/preferences";
import {
  syncConnectionUp,
  syncAddressState,
  syncChaintip,
  selectChaintip,
} from "@/redux/sync";

import LogService from "@/services/LogService";
import { AddressEntity } from "@/services/AddressManagerService";
import BlockchainService from "@/services/BlockchainService";

//import { bchToSats } from "@/util/sats";
import { electrum_servers, ElectrumServer } from "@/util/electrum_servers";

const Log = LogService("Electrum");

export class ElectrumNotConnectedError extends Error {
  constructor() {
    super(`ElectrumNotConnectedError`);
  }
}

export class ElectrumVersionMismatchError extends Error {}

export const ELECTRUM_PROTOCOL_VERSION = "1.5";
export const ROSTRUM_PROTOCOL_VERSION = "1.4.3";

// pointer for current ElectrumClient instance
const electrum_handles = new Map<
  string,
  ElectrumClient<ElectrumClientEvents> | null
>();

const server_blacklist: Array<string> = [];
const pendingTxRequests: Array<Promise<object>> = [];

// ElectrumService: brokers interactions with electrum server
export default function ElectrumService(bchNetwork = "mainnet") {
  let electrum: ElectrumClient<ElectrumClientEvents> | null =
    electrum_handles.get(bchNetwork) || null;

  return {
    connect,
    disconnect,
    getIsConnected,
    subscribeToAddress,
    subscribeToChaintip,
    //requestBalance,
    requestAddressState,
    requestAddressHistory,
    requestScripthashHistory,
    requestUtxos,
    requestUtxoInfo,
    requestTransaction,
    requestMerkle,
    requestBlockHeader,
    requestBlock,
    broadcastTransaction,
    //requestRelayFee,
    selectFallbackServer,
    getElectrumHost,
    getElectrumClient,
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  async function connect(server?: string, withListeners = true) {
    const server_list = electrum_servers[bchNetwork];

    const connectServer = server || server_list[0];

    Log.log("Connecting to", connectServer, bchNetwork);

    if (electrum !== null) {
      // force disconnect old electrum object to ensure all handlers are cleared
      if (electrum.status !== ConnectionStatus.DISCONNECTED) {
        await electrum.disconnect(true);
      }

      // explicitly set electrum to null to prompt garbage collection
      electrum = null;
      electrum_handles.set(bchNetwork, null);
    }

    // pre-configure the Electrum socket
    const parts = ElectrumServer.toParts(connectServer);
    const socket = new ElectrumWebSocket(parts.host, parts.port);

    const protocolVersion =
      bchNetwork === "cauldron"
        ? ROSTRUM_PROTOCOL_VERSION
        : ELECTRUM_PROTOCOL_VERSION;

    // create a new ElectrumClient every time to enable server switching
    electrum = new ElectrumClient("Selene.cash", protocolVersion, socket);
    electrum_handles.set(bchNetwork, electrum);

    // need to establish listeners every time we recreate the ElectrumClient
    if (withListeners) {
      electrum.addListener("connected", () => {
        if (typeof withListeners.connected === "function") {
          withListeners.connected();
        } else {
          Log.log("ELECTRUM CONNECTED", getElectrumHost());
          store.dispatch(syncConnectionUp());
        }
      });

      electrum.addListener("notification", (data) => {
        if (typeof withListeners.notification === "function") {
          withListeners.notification(data);
        } else {
          handleElectrumNotifications(data);
        }
      });

      electrum.addListener("disconnected", () => {
        if (typeof withListeners.disconnected === "function") {
          withListeners.disconnected();
        } else {
          Log.log("ELECTRUM DISCONNECTED");
        }
      });

      electrum.addListener("connecting", () => {
        Log.debug("connecting...");
      });

      electrum.addListener("reconnecting", () => {
        Log.debug("reconnecting...");
      });

      electrum.addListener("disconnecting", () => {
        Log.debug("disconnecting...");
      });

      electrum.addListener("error", handleElectrumError);
    }

    try {
      await electrum.connect();
      return true;
    } catch (e) {
      const isProtocolVersionMismatch = `${e}`.includes(
        ELECTRUM_PROTOCOL_VERSION
      );

      if (isProtocolVersionMismatch) {
        throw new ElectrumVersionMismatchError();
      }

      Log.error(e);
      throw new Error(`Connection to ${server} failed. ${e}`);
    }
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force: boolean) {
    if (electrum !== null) {
      Log.debug("electrum disconnect");
      return electrum.disconnect(force);
    }

    electrum = null;
    return true;
  }

  function getIsConnected() {
    return electrum !== null
      ? electrum.status === ConnectionStatus.CONNECTED
      : false;
  }

  // subscribeToAddress: listen for updates on an address
  async function subscribeToAddress(address: AddressEntity): Promise<void> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    //Log.debug("subscribeToAddress", address.address);

    // use `request` instead of `subscribe`
    // this bypasses electrum-cash's subscription management
    // otherwise we end up sending 2 requests per subscription
    const result = await electrum.request(
      "blockchain.address.subscribe",
      address.address
    );

    // manually emit initial notification
    handleElectrumNotifications({
      method: "blockchain.address.subscribe",
      params: [address.address, result],
    });
  }

  async function subscribeToChaintip(): Promise<void> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    // use `request` instead of `subscribe`
    // this bypasses electrum-cash's subscription management
    // otherwise we end up sending 2 requests per subscription
    const result = await electrum.request("blockchain.headers.subscribe");

    // manually emit initial notification
    handleElectrumNotifications({
      method: "blockchain.headers.subscribe",
      params: [result],
    });
  }

  // request the most up-to-date balance information for an address
  /*
  // this function isn't actually used, so prune it from distribution by commenting for now
  async function requestBalance(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const result = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    if (result instanceof Error) {
      throw result;
    }

    const { confirmed, unconfirmed } = result;

    return confirmed + unconfirmed;
  }
  */

  // request the most up-to-date state hash for an address
  async function requestAddressState(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    if (addressState instanceof Error) {
      throw addressState;
    }

    return addressState as string;
  }

  // request the entire transaction history for an address
  async function requestAddressHistory(
    address: string,
    startHeight: number = 0,
    endHeight: number = -1
  ) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const history = await electrum.request(
      "blockchain.address.get_history",
      address,
      startHeight,
      endHeight
    );

    if (history instanceof Error) {
      throw history;
    }

    return history;
  }

  // request the transaction history for a scripthash
  async function requestScripthashHistory(scripthash: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const history = await electrum.request(
      "blockchain.scripthash.get_history",
      scripthash
    );

    if (history instanceof Error) {
      throw history;
    }

    return history;
  }

  // request all current UTXOs for an address
  async function requestUtxos(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const utxos = await electrum.request(
      "blockchain.address.listunspent",
      address
    );

    if (utxos instanceof Error) {
      throw utxos;
    }

    return utxos;
  }

  async function requestUtxoInfo(tx_hash: string, tx_pos: number) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const utxoInfo = await electrum.request(
      "blockchain.utxo.get_info",
      tx_hash,
      tx_pos
    );

    return utxoInfo;
  }

  // request a transaction by its txid
  async function requestTransaction(tx_hash: string, verbose: boolean = true) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    // de-duplicate transaction requests
    if (pendingTxRequests[tx_hash]) {
      Log.warn("waiting on resolution for", tx_hash);
      return pendingTxRequests[tx_hash];
    }

    const txRequest = electrum
      .request("blockchain.transaction.get", tx_hash, verbose)
      .then((tx) => {
        //Log.debug(tx);
        if (tx instanceof Error) {
          throw tx;
        }
        // [Kludge?] I don't like accessing redux here but not certain SQL chaintip is reliable
        const chaintip = selectChaintip(store.getState());
        const height = tx.confirmations
          ? chaintip.height - tx.confirmations
          : 0;

        //Log.debug("height", height, tx_hash, tx.confirmations);

        delete pendingTxRequests[tx_hash];
        return { ...tx, height };
      })
      .catch((e) => {
        Log.error("txRequest failed", e);
        throw e;
      });

    pendingTxRequests[tx_hash] = txRequest;

    return txRequest;
  }

  // requestMerkle: request merkle proof for a transaction
  async function requestMerkle(tx_hash, height) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const merkle = await electrum.request(
      "blockchain.transaction.get_merkle",
      tx_hash,
      height
    );

    return merkle;
  }

  // requestBlockHeader: request a block by height
  async function requestBlockHeader(height, checkpoint_height = 0) {
    if (height < 0 || checkpoint_height < 0) {
      throw new Error("height must be non-negative integer");
    }

    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const header = await electrum.request(
      "blockchain.block.header",
      height,
      checkpoint_height
    );

    if (header instanceof Error) {
      throw header;
    }

    Log.debug("requestBlockHeader", header, height);
    return header;
  }

  // requestBlock: request a block by height or hash
  async function requestBlock(blockhashOrHeight: string | number) {
    const block = await electrum.request(
      "blockchain.header.get",
      blockhashOrHeight
    );

    if (block instanceof Error) {
      throw block;
    }

    const blockhash = BlockchainService().calculateBlockhash(block.hex);

    Log.debug("requestBlock", block, blockhash);
    return { ...block, blockhash };
  }

  async function broadcastTransaction(tx_hex): Promise<string> {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }

    if (electrum.status !== ConnectionStatus.CONNECTED) {
      return new Promise((resolve) => {
        setTimeout(() => {
          Log.debug("retry broadcast");
          resolve(broadcastTransaction(tx_hex));
        }, 120);
      });
    }

    const tx_hash = await electrum.request(
      "blockchain.transaction.broadcast",
      tx_hex
    );

    if (typeof tx_hash !== "string") {
      throw new Error(tx_hash?.toString());
    }

    Log.log("broadcastTransaction", tx_hash, tx_hex);
    return tx_hash;
  }

  /*
  // unused, prune from dist
  async function requestRelayFee() {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const result = await electrum.request("blockchain.relayfee");

    if (result instanceof Error) {
      throw error;
    }

    const relayFee = bchToSats(result);
    return relayFee;
  }
  */

  function selectFallbackServer(prevServer): string {
    const server_list = electrum_servers[bchNetwork];

    // don't blacklist the known-good Selene-operated server
    if (prevServer && prevServer !== server_list[0]) {
      server_blacklist.push(prevServer);
    }

    const filtered_server_list = server_list.filter(
      (s) => !server_blacklist.includes(s)
    );

    const chooseRandomServer = () => {
      return filtered_server_list[
        Math.floor(Math.random() * filtered_server_list.length)
      ];
    };

    const newServer = chooseRandomServer();

    // only overwrite user server preference on mainnet
    if (bchNetwork === "mainnet") {
      store.dispatch(
        setPreference({
          key: "electrumServer",
          value: newServer,
        })
      );
    }

    Log.log(
      "selectFallbackServer",
      newServer,
      prevServer,
      server_blacklist,
      bchNetwork
    );

    return newServer;
  }

  function getElectrumHost(): string {
    return electrum ? electrum.hostIdentifier : "";
  }

  function getElectrumClient() {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }

    return electrum;
  }
}

function handleElectrumNotifications(data) {
  if (data.method === "blockchain.address.subscribe") {
    store.dispatch(syncAddressState(data.params));
  }

  if (data.method === "blockchain.headers.subscribe") {
    handleChaintipSubscription(data.params);
  }
}

function handleElectrumError(error) {
  Log.warn(error);
}

function handleChaintipSubscription(data) {
  if (!Array.isArray(data)) {
    return;
  }

  const chaintip = data[0];
  store.dispatch(syncChaintip(chaintip));
}

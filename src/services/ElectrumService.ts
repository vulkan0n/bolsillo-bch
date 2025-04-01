import {
  ElectrumClient,
  ConnectionStatus,
  ElectrumClientEvents,
} from "@electrum-cash/network";
import { ElectrumWebSocket } from "@electrum-cash/web-socket";
import { store } from "@/redux";
import { selectBchNetwork, setPreference } from "@/redux/preferences";
import {
  syncConnectionUp,
  syncConnectionDown,
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

// pointer for current ElectrumClient instance
let electrum: ElectrumClient<ElectrumClientEvents> | null = null;

const server_blacklist: Array<string> = [];
const pendingTxRequests: Array<Promise<object>> = [];

// ElectrumService: brokers interactions with electrum server
export default function ElectrumService() {
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
    //requestMerkle,
    requestBlockHeader,
    requestBlock,
    broadcastTransaction,
    //requestRelayFee,
    selectFallbackServer,
    getElectrumHost,
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  async function connect(server: string) {
    const bchNetwork = selectBchNetwork(store.getState());
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
    }

    // pre-configure the Electrum socket
    const parts = ElectrumServer.toParts(connectServer);
    const socket = new ElectrumWebSocket(parts.host, parts.port);

    // create a new ElectrumClient every time to enable server switching
    electrum = new ElectrumClient("Selene.cash", "1.5", socket);

    // need to establish listeners every time we recreate the ElectrumClient
    electrum.addListener("connected", () => {
      Log.log("ELECTRUM CONNECTED", getElectrumHost());

      store.dispatch(syncConnectionUp());
    });

    electrum.addListener("notification", handleElectrumNotifications);

    electrum.addListener("disconnected", () => {
      Log.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown());
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

    return electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force: boolean) {
    if (electrum !== null) {
      Log.debug("electrum disconnect");
      return electrum.disconnect(force);
    }

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

    return electrum.subscribe("blockchain.address.subscribe", address.address);
  }

  async function subscribeToChaintip(): Promise<void> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    return electrum.subscribe("blockchain.headers.subscribe");
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

    if (pendingTxRequests[tx_hash]) {
      Log.warn("waiting on resolution for", tx_hash);
      return pendingTxRequests[tx_hash];
    }

    const txRequest = electrum
      .request("blockchain.transaction.get", tx_hash, verbose)
      .then((tx) => {
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

  /*
  // unused, prune from dist payload for now
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
  */

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

  async function broadcastTransaction(tx_hex) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const tx_hash = await electrum.request(
      "blockchain.transaction.broadcast",
      tx_hex
    );

    if (tx_hash instanceof Error) {
      throw tx_hash;
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
    const bchNetwork = selectBchNetwork(store.getState());

    const server_list = electrum_servers[bchNetwork];

    // don't blacklist the known-good Selene-operated server
    if (prevServer && prevServer !== server_list[0]) {
      server_blacklist.push(prevServer);
    }

    const filtered_server_list = server_list.filter((s) =>
      server_blacklist.includes(s)
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

function getElectrumHost(): string {
  return electrum ? electrum.hostIdentifier : "";
}

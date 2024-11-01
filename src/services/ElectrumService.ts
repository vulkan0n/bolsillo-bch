import { ElectrumClient, ConnectionStatus } from "@electrum-cash/network";
import { store } from "@/redux";
import { selectBchNetwork, setPreference } from "@/redux/preferences";
import {
  syncConnectionUp,
  syncConnectionDown,
  syncAddressState,
  syncChaintip,
} from "@/redux/sync";

import LogService from "@/services/LogService";
import { AddressEntity } from "@/services/AddressManagerService";

import { bchToSats } from "@/util/sats";
import { electrum_servers } from "@/util/electrum_servers";

const Log = LogService("Electrum");

export class ElectrumNotConnectedError extends Error {
  constructor() {
    super(`ElectrumNotConnectedError`);
  }
}

// pointer for current ElectrumClient instance
let electrum: ElectrumClient | null = null;

const server_blacklist: Array<string> = [];
const pendingTxRequests: Array<Promise<object>> = [];

// ElectrumService: brokers interactions with electrum server
export default function ElectrumService() {
  return {
    connect,
    disconnect,
    subscribeToAddress,
    subscribeToChaintip,
    requestBalance,
    requestAddressState,
    requestAddressHistory,
    requestUtxos,
    requestTransaction,
    requestMerkle,
    requestBlock,
    broadcastTransaction,
    requestRelayFee,
    selectFallbackServer,
    getElectrumHost,
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  // Destroys existing ElectrumClient if out of sync with Redux state
  async function connect(server: string = electrum_servers.mainnet[0]) {
    Log.log("Connecting to", server);

    if (
      electrum !== null &&
      electrum.status !== ConnectionStatus.DISCONNECTED
    ) {
      await electrum.disconnect(true);
    }

    // create a new ElectrumClient every time to enable server switching
    electrum = new ElectrumClient("Selene.cash", "1.4", server);

    // need to establish listeners every time we recreate the ElectrumClient
    electrum.addListener("connected", () => {
      Log.log("ELECTRUM CONNECTED", server);
      store.dispatch(syncConnectionUp(server));
    });

    electrum.addListener("disconnected", () => {
      Log.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown());
    });

    electrum.addListener("notification", handleElectrumNotifications);
    electrum.addListener("error", handleElectrumError);

    return electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force: boolean) {
    if (electrum !== null) {
      return electrum.disconnect(force, false);
    }

    return true;
  }

  // subscribeToAddress: listen for updates on an address
  async function subscribeToAddress(
    address: AddressEntity
  ): Promise<{ address: AddressEntity; addressState: string | null }> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    return electrum.subscribe("blockchain.address.subscribe", address.address);
  }

  async function subscribeToChaintip(): Promise<boolean> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    return electrum.subscribe("blockchain.headers.subscribe");
  }

  // request the most up-to-date balance information for an address
  async function requestBalance(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    return confirmed + unconfirmed;
  }

  // request the most up-to-date state hash for an address
  async function requestAddressState(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    if (!(addressState === null || typeof addressState === "string")) {
      throw new Error(addressState.toString());
    }

    return addressState;
  }

  // request the entire transaction history for an address
  async function requestAddressHistory(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const history = await electrum.request(
      "blockchain.address.get_history",
      address
    );

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

    return utxos;
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
        delete pendingTxRequests[tx_hash];
        return tx;
      });

    pendingTxRequests[tx_hash] = txRequest;

    return txRequest;
  }

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

  // requestBlock: request a block by height
  async function requestBlock(height, checkpoint_height = 0) {
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

    Log.debug("requestBlock", header, height);
    return header;
  }

  async function broadcastTransaction(tx_hex) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const tx_hash = await electrum.request(
      "blockchain.transaction.broadcast",
      tx_hex
    );

    Log.log("broadcastTransaction", tx_hash, tx_hex);
    return tx_hash;
  }

  async function requestRelayFee() {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const result = await electrum.request("blockchain.relayfee");

    const relayFee = bchToSats(result);
    return relayFee;
  }

  function selectFallbackServer(prevServer) {
    const bchNetwork = selectBchNetwork(store.getState());
    const server_list = electrum_servers[bchNetwork];

    // don't blacklist the known-good Selene-operated server
    if (prevServer && prevServer !== server_list[0]) {
      server_blacklist.push(prevServer);
    }

    const chooseRandomServer = () => {
      return server_list[Math.floor(Math.random() * server_list.length)];
    };

    let newServer = chooseRandomServer();
    while (server_blacklist.indexOf(newServer) > -1) {
      newServer = chooseRandomServer();
    }

    if (bchNetwork === "mainnet") {
      store.dispatch(
        setPreference({ key: "electrumServer", value: newServer })
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
  Log.error(error);
}

function handleChaintipSubscription(data) {
  if (!Array.isArray(data)) {
    return;
  }

  const chaintip = data[0];
  store.dispatch(syncChaintip(chaintip));
}

function getElectrumHost() {
  return electrum ? electrum.connection.host : "";
}

/*App.addListener("resume", () =>
  store.dispatch(syncConnect({ server: getElectrumHost(), attempts: 0 }))
);*/

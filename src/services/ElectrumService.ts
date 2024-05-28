import { ElectrumClient, ElectrumTransport } from "electrum-cash";
import { App } from "@capacitor/app";
import { store } from "@/redux";
import {
  syncConnect,
  syncConnectionUp,
  syncConnectionDown,
  syncAddressState,
  syncChaintip,
  selectSyncState,
} from "@/redux/sync";

import LogService from "@/services/LogService";
import { AddressEntity } from "@/services/AddressManagerService";

import { bchToSats } from "@/util/sats";
import { electrum_servers, chipnet_servers } from "@/util/electrum_servers";

const Log = LogService("Electrum");

const DEFAULT_ELECTRUM_SERVER = electrum_servers[0];

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
  async function connect(
    server: string = DEFAULT_ELECTRUM_SERVER
  ): Promise<void> {
    // using redux connection state guarantees that
    // we only create new ElectrumClient when necessary
    if (selectSyncState(store.getState()).connected) {
      return Promise.resolve();
    }

    // ensure all references to old ElectrumClient are killed
    // so that it gets garbage collected
    if (electrum !== null) {
      // disconnect(force=true) cleans up all listeners and timeouts
      await electrum.disconnect(true);
    }
    Log.log("Electrum: Connecting to", server);

    // Create a new ElectrumClient every time
    // This avoids memory leaks from EventEmitter
    // Also allows us to switch servers on the fly
    electrum = new ElectrumClient(
      "Selene.cash",
      "1.4",
      server,
      ElectrumTransport.WSS.Port,
      ElectrumTransport.WSS.Scheme
    );

    // need to establish listeners every time we recreate the ElectrumClient
    electrum.addListener("connected", () => {
      Log.log("ELECTRUM CONNECTED");
      store.dispatch(syncConnectionUp(server));
    });

    electrum.addListener("disconnected", () => {
      Log.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown());
    });

    return electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force: boolean): Promise<boolean> {
    if (electrum !== null) {
      return electrum.disconnect(force);
    }

    return true;
  }

  // subscribeToAddress: listen for updates on an address
  async function subscribeToAddress(
    address: AddressEntity
  ): Promise<{ address: AddressEntity; addressState: string }> {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }

    const didSubscribe = await electrum.subscribe(
      handleAddressSubscription,
      "blockchain.address.subscribe",
      address.address
    );

    if (!didSubscribe) {
      throw new ElectrumNotConnectedError();
    }

    const addressState = (await electrum.request(
      "blockchain.address.subscribe",
      address.address
    )) as string;

    return { address, addressState };
  }

  async function subscribeToChaintip(): Promise<boolean> {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }

    const isSubscribed = electrum.subscribe(
      handleChaintipSubscription,
      "blockchain.headers.subscribe"
    );

    return isSubscribed;
  }

  // request the most up-to-date balance information for an address
  async function requestBalance(address) {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }

    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    return confirmed + unconfirmed;
  }

  // request the most up-to-date state hash for an address
  async function requestAddressState(address) {
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    return addressState;
  }

  // request the entire transaction history for an address
  async function requestAddressHistory(address) {
    if (electrum === null) {
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
    if (electrum === null) {
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
    if (electrum === null) {
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
    if (electrum === null) {
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

    if (electrum === null) {
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
    if (electrum === null) {
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
    if (electrum === null) {
      throw new ElectrumNotConnectedError();
    }
    const result = await electrum.request("blockchain.relayfee");

    const relayFee = bchToSats(result);
    return relayFee;
  }

  function selectFallbackServer(prevServer, isChipnet = false) {
    // don't blacklist the known-good Selene-operated server
    if (prevServer && prevServer !== DEFAULT_ELECTRUM_SERVER) {
      server_blacklist.push(prevServer);
    }

    const server_list = isChipnet ? chipnet_servers : electrum_servers;

    const chooseRandomServer = () => {
      return server_list[Math.floor(Math.random() * server_list.length)];
    };

    let newServer = chooseRandomServer();
    while (server_blacklist.indexOf(newServer) > -1) {
      newServer = chooseRandomServer();
    }

    Log.log(
      "selectFallbackServer",
      newServer,
      prevServer,
      server_blacklist,
      isChipnet
    );
    return newServer;
  }
}

// named function for address subscription, keeps electrum-cash performant
// important that the pointer to this function never changes
// so we define it on top-level
function handleAddressSubscription(data) {
  store.dispatch(syncAddressState(data));
}

function handleChaintipSubscription(data) {
  const chaintip = Array.isArray(data) ? data[0] : data;
  store.dispatch(syncChaintip(chaintip));
}

function getElectrumHost() {
  return electrum ? electrum.connection.host : "";
}

App.addListener("resume", () =>
  store.dispatch(syncConnect({ server: getElectrumHost(), attempts: 0 }))
);

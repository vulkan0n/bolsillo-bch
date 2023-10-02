/* eslint-disable no-console */
import { ElectrumClient, ElectrumTransport } from "electrum-cash";

import { App } from "@capacitor/app";

import { store } from "@/redux";
import {
  syncConnect,
  syncConnectionUp,
  syncConnectionDown,
  syncAddressUpdate,
  syncChaintip,
} from "@/redux/sync";
import { selectIsChipnet } from "@/redux/preferences";

import { bchToSats } from "@/util/sats";
import { electrum_servers, chipnet_servers } from "@/util/electrum_servers";

const DEFAULT_ELECTRUM_SERVER = electrum_servers[0];

const server_blacklist = [];

// pointer for current ElectrumClient instance
let electrum = null;

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
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  // Destroys existing ElectrumClient if out of sync with Redux state
  async function connect(server = DEFAULT_ELECTRUM_SERVER) {
    // using redux connection state guarantees that
    // we only create new ElectrumClient when necessary
    if (store.getState().sync.connected) {
      return Promise.resolve(true);
    }

    // ensure all references to old ElectrumClient are killed
    // so that it gets garbage collected
    if (electrum !== null) {
      // disconnect(force=true) cleans up all listeners and timeouts
      await electrum.disconnect(true);
    }
    console.log("Electrum: Connecting to", server);

    // Create a new ElectrumClient every time
    // This avoids memory leaks from EventEmitter
    // Also allows us to switch servers on the fly
    electrum = new ElectrumClient(
      "Selene.cash",
      "1.5.1",
      server,
      ElectrumTransport.WSS.Port,
      ElectrumTransport.WSS.Scheme
    );

    // need to establish listeners every time we recreate the ElectrumClient
    electrum.addListener("connected", () => {
      console.log("ELECTRUM CONNECTED");
      store.dispatch(syncConnectionUp());
    });

    electrum.addListener("disconnected", () => {
      console.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown({ server }));
    });

    return electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force) {
    if (electrum !== null) {
      return electrum.disconnect(force);
    }

    return true;
  }

  // subscribeToAddress: listen for updates on an address
  async function subscribeToAddress(address) {
    try {
      if (
        await electrum.subscribe(
          handleAddressSubscription,
          "blockchain.address.subscribe",
          address
        )
      ) {
        const addressState = await electrum.request(
          "blockchain.address.subscribe",
          address
        );

        // don't emit subscription update for unused (null state) addresses
        if (addressState !== null) {
          handleAddressSubscription([address, addressState]);
        }

        return address;
      }

      return false;
    } catch (e) {
      // throws if electrum is disconnected
      console.error(e);
      return false;
    }
  }

  async function subscribeToChaintip() {
    try {
      return electrum.subscribe(
        handleChaintipSubscription,
        "blockchain.headers.subscribe"
      );
    } catch (e) {
      // throws if electrum is disconnected
      return Promise.reject(e);
    }
  }

  // request the most up-to-date balance information for an address
  async function requestBalance(address) {
    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    return confirmed + unconfirmed;
  }

  // request the most up-to-date state hash for an address
  async function requestAddressState(address) {
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    return addressState;
  }

  // request the entire transaction history for an address
  async function requestAddressHistory(address) {
    const history = await electrum.request(
      "blockchain.address.get_history",
      address
    );

    return history;
  }

  // request all current UTXOs for an address
  async function requestUtxos(address) {
    const utxos = await electrum.request(
      "blockchain.address.listunspent",
      address
    );

    return utxos;
  }

  // request a transaction by its txid
  async function requestTransaction(tx_hash, verbose = true) {
    const transaction = await electrum.request(
      "blockchain.transaction.get",
      tx_hash,
      verbose
    );

    return transaction;
  }

  async function requestMerkle(tx_hash, height) {
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

    const header = await electrum.request(
      "blockchain.block.header",
      height,
      checkpoint_height
    );

    //console.log("requestBlock", header, height);
    return header;
  }

  async function broadcastTransaction(tx_hex) {
    const tx_hash = await electrum.request(
      "blockchain.transaction.broadcast",
      tx_hex
    );

    //console.log("broadcastTransaction", tx_hash, tx_hex);
    return tx_hash;
  }

  async function requestRelayFee() {
    const result = await electrum.request("blockchain.relayfee");

    const relayFee = bchToSats(result);
    return relayFee;
  }

  function selectFallbackServer(prevServer) {
    const isChipnet = selectIsChipnet(store.getState());

    // don't blacklist chipnet servers or the known-good Selene-operated server
    if (prevServer !== DEFAULT_ELECTRUM_SERVER && !isChipnet) {
      server_blacklist.push(prevServer);
    }

    let newServer = prevServer;
    while (server_blacklist.indexOf(newServer) !== -1) {
      newServer = isChipnet
        ? chipnet_servers[Math.floor(Math.random() * chipnet_servers.length)]
        : electrum_servers[Math.floor(Math.random() * electrum_servers.length)];
    }

    return newServer;
  }
}

// named function for address subscription, keeps electrum-cash performant
// important that the pointer to this function never changes
// so we define it on top-level
function handleAddressSubscription(data) {
  store.dispatch(syncAddressUpdate(data));
}

function handleChaintipSubscription(data) {
  const chaintip = Array.isArray(data) ? data[0] : data;
  store.dispatch(syncChaintip(chaintip));
}

function getElectrumHost() {
  return electrum && electrum.connection.host;
}

App.addListener("resume", () =>
  store.dispatch(syncConnect({ server: getElectrumHost(), attempts: 0 }))
);

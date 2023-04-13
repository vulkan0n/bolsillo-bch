import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import { store } from "@/redux";
import {
  syncConnectionUp,
  syncConnectionDown,
  syncAddressUpdate,
  syncChaintip,
} from "@/redux/sync";

// pointer for current ElectrumClient instance
let electrum = null;

// ElectrumService
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
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  // Destroys existing ElectrumClient if out of sync with Redux state
  async function connect(server = "cashnode.bch.ninja") {
    // using redux connection state guarantees that
    // we only create new ElectrumClient when necessary
    if (store.getState().sync.connected) {
      return;
    }

    // ensure all references to old ElectrumClient are killed
    // so that it gets garbage collected
    if (electrum !== null) {
      // disconnect(force=true) cleans up all listeners and timeouts
      await electrum.disconnect(true);
    }

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
      console.log("ELECTRUM CONNECTED");
      store.dispatch(syncConnectionUp());
    });

    electrum.addListener("disconnected", () => {
      console.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown());
    });

    return await electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force) {
    if (electrum !== null) {
      return await electrum.disconnect(force);
    }
  }

  // listen for updates on an address
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
    } catch (e) {
      // throws if electrum is disconnected
      console.error(e);
      return false;
    }
  }

  async function subscribeToChaintip() {
    try {
      await electrum.subscribe(
        handleChaintipSubscription,
        "blockchain.headers.subscribe"
      );
    } catch (e) {
      // throws if electrum is disconnected
      console.error(e);
      return false;
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
  async function requestTransaction(tx_hash) {
    const transaction = await electrum.request(
      "blockchain.transaction.get",
      tx_hash,
      true
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

  async function requestBlock(height, checkpoint_height = 0) {
    if (height < 0 || checkpoint_height < 0) {
      throw new Error("height must be non-negative integer");
    }

    const header = await electrum.request(
      "blockchain.block.header",
      height,
      checkpoint_height
    );

    console.log("requestBlock", header, height);

    return header;
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

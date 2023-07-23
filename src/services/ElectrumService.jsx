import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import { App } from "@capacitor/app";
import { Haptics } from "@capacitor/haptics";

import { store } from "@/redux";
import {
  syncConnect,
  syncConnectionUp,
  syncConnectionDown,
  syncAddressUpdate,
  syncChaintip,
} from "@/redux/sync";

import { bchToSats } from "@/util/sats";
import { DEFAULT_ELECTRUM_SERVER } from "@/util/consts/recommendedElectrumServers";
import showToast from "@/util/toast";

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
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  // Destroys existing ElectrumClient if out of sync with Redux state
  async function connect(server = DEFAULT_ELECTRUM_SERVER) {
    console.log("connecting!!!");
    console.log("server: ", server);

    console.log(
      "electrumServer: ",
      store.getState().preferences.electrumServer
    );
    console.log(
      "customElectrumServer: ",
      store.getState().preferences.customElectrumServer
    );
    const electrumServer = store.getState().preferences?.electrumServer;
    const customElectrumServer =
      store.getState().preferences?.customElectrumServer;
    const serverPreference =
      customElectrumServer ||
      electrumServer ||
      server ||
      DEFAULT_ELECTRUM_SERVER;
    const fallbackServerPreference =
      electrumServer || server || DEFAULT_ELECTRUM_SERVER;

    console.log({ serverPreference });
    // using redux connection state guarantees that
    // we only create new ElectrumClient when necessary
    if (store.getState().sync.connected) {
      console.log("already connected");
      return;
    }

    console.log("connecting..");

    // ensure all references to old ElectrumClient are killed
    // so that it gets garbage collected
    if (electrum !== null) {
      // disconnect(force=true) cleans up all listeners and timeouts
      await electrum.disconnect(true);
    }

    const createElectrumInstance = (providedServer) => {
      // Create a new ElectrumClient every time
      // This avoids memory leaks from EventEmitter
      // Also allows us to switch servers on the fly
      electrum = new ElectrumClient(
        "Selene.cash",
        "1.4",
        providedServer,
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

      return electrum;
    };

    const firstPreferenceElectrum = createElectrumInstance(serverPreference);

    try {
      return await firstPreferenceElectrum.connect();
    } catch (e) {
      await Haptics.notification({ type: "ERROR" });

      // If user has provided an unreachable/invalid custom Electrum Server
      // Alert with toast & fallback to a server from the known list
      showToast({
        title: "Custom Electrum server not found",
        description: (
          <span>
            <div className="inline-block text-sm break-all">
              Falling back to known server: {`${fallbackServerPreference}`}
            </div>
          </span>
        ),
      });

      const fallbackElectrum = createElectrumInstance(fallbackServerPreference);
      return await fallbackElectrum.connect();
    }
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force) {
    if (electrum !== null) {
      return await electrum.disconnect(force);
    }
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

App.addListener("resume", () => store.dispatch(syncConnect()));

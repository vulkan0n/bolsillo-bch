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
} from "@/redux/sync";

let electrum = null;

function ElectrumService() {
  return {
    connect,
    disconnect,
    subscribeToAddress,
    requestBalance,
    requestAddressState,
    requestAddressHistory,
    requestUtxos,
    requestTransaction,
  };

  async function connect() {
    if (store.getState().sync.connected) {
      return;
    }

    electrum = new ElectrumClient(
      "Selene.cash",
      "1.4",
      "cashnode.bch.ninja",
      ElectrumTransport.WSS.Port,
      ElectrumTransport.WSS.Scheme
    );

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

  async function disconnect(force) {
    return await electrum.disconnect(force);
  }

  // named function for address subscription, keeps electrum-cash performant
  function handleAddressSubscription(data) {
    store.dispatch(syncAddressUpdate(data));
  }

  async function subscribeToAddress(address) {
    try {
      //console.log("subscribing to", address);
      await electrum.subscribe(
        handleAddressSubscription,
        "blockchain.address.subscribe",
        address
      );
    } catch (e) {
      // throws if electrum is disconnected
      console.error(e);
    }
  }

  // demand the most up-to-date balance information for an address
  async function requestBalance(address) {
    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    return confirmed + unconfirmed;
  }

  async function requestAddressState(address) {
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    return addressState;
  }

  async function requestAddressHistory(address) {
    const history = await electrum.request(
      "blockchain.address.get_history",
      address
    );

    console.log("requestAddressHistory", address, history);

    return history;
  }

  async function requestUtxos(address) {
    const utxos = await electrum.request(
      "blockchain.address.listunspent",
      address
    );

    console.log("requestUtxos", address, utxos);

    return utxos;
  }

  async function requestTransaction(txid) {
    const transaction = await electrum.request(
      "blockchain.transaction.get",
      txid,
      true
    );

    return transaction;
  }
}

export default ElectrumService;

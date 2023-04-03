import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import { store } from "@/redux";
import { walletAddressStateUpdate } from "@/redux/wallet";

const electrum = new ElectrumClient(
  "Selene.cash",
  "1.4",
  "cashnode.bch.ninja",
  ElectrumTransport.WSS.Port,
  ElectrumTransport.WSS.Scheme
);

try {
  await electrum.connect();
} catch (e) {
  console.error(e);
}

function ElectrumService() {
  return {
    subscribeToAddress,
    requestBalance,
    requestAddressState,
  };

  function handleAddressSubscription(data) {
    store.dispatch(walletAddressStateUpdate(data));
  }

  async function subscribeToAddress(address) {
    try {
      console.log("subscribing to", address);
      await electrum.subscribe(
        handleAddressSubscription,
        "blockchain.address.subscribe",
        address
      );
    } catch (e) {
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
    console.log("requestAddressState", address, addressState);
    return addressState;
  }

  // handler function for updates received from electrum subscription
  // handleAddressSubscription
  async function handleBalanceUpdate(update) {
    // TODO: compare initial balance state hash to state hash in DB
    if (!Array.isArray(update)) {
      console.log("address state update", update);
      const addressResult = resultToJson(
        db.exec(`SELECT address FROM addresses WHERE state="${update}"`)
      );
      if (addressResult.length === 0) {
        //fetchAddressHistories();
      }
      // `SELECT address,state FROM addresses WHERE state='${update}'`
      // if result, skip history check for the found address
      // if no result, download blockchain.address.get_history for all non-null states
      return;
    }

    console.log("handleBalanceUpdate", update);
    const address = update[0];
    const addressState = update[1];
    updateAddressState(address, addressState);

    const balance = await requestBalance(address);

    document.dispatchEvent(
      new CustomEvent("balanceUpdate", { detail: balance })
    );
  }
}

export default ElectrumService;

// TODO: only subscribe to addresses with non-null state and top N unused
// don't subscribe to change
// instead, directly request state per address
// get history when there are discrepancies
//addresses.forEach((address) => subscribeToAddress(address));

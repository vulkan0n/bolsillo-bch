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
  // persist this information to the database
  async function requestBalance(address) {
    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    const addressBalance = confirmed + unconfirmed;

    db.run(
      `UPDATE addresses SET balance="${addressBalance}" WHERE address="${address}"`
    );

    const wallet_id = resultToJson(
      db.exec(`SELECT wallet_id FROM addresses WHERE address="${address}"`)
    )[0].wallet_id;

    const walletBalance = resultToJson(
      db.exec(
        `UPDATE wallets SET balance=(SELECT SUM(balance) FROM addresses WHERE wallet_id="${wallet_id}") RETURNING balance`
      )
    )[0].balance;

    console.log("requestBalance", address, addressBalance, walletBalance);
    await saveDatabase();

    return walletBalance;
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

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
      //console.log("subscribing to", address);
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

    return addressState;
  }
}

export default ElectrumService;

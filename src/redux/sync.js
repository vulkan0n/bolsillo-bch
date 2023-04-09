import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import ElectrumService from "@/services/ElectrumService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionService from "@/services/TransactionService";

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (attempts = 0, thunkApi) => {
    const Electrum = new ElectrumService();
    try {
      await Electrum.connect();
    } catch (e) {
      await Electrum.disconnect(true);
      setTimeout(() =>
        thunkApi.dispatch(
          syncConnect(attempts + 1),
          Math.pow(1000 * attempts, attempts)
        )
      );
    }
  }
);

// syncConnectionUp: fired when electrum connection is up
export const syncConnectionUp = createAction("sync/up");
syncMiddleware.startListening({
  actionCreator: syncConnectionUp,
  effect: async (action, listenerApi) => {
    console.log("syncConnectionUp");
    // set up electrum subscriptions
    const AddressManager = new AddressManagerService();
    const addresses = AddressManager.getReceiveAddresses();
    const Electrum = new ElectrumService();
    addresses.forEach(({ address }) => Electrum.subscribeToAddress(address));
  },
});

// syncConnectionDown: fired when electrum connection is down
export const syncConnectionDown = createAction("sync/down");
syncMiddleware.startListening({
  actionCreator: syncConnectionDown,
  effect: async (action, listenerApi) => {
    // cleanup electrum subscriptions
    // we'll handle resubscribing ourselves
    new ElectrumService().disconnect(true);
    listenerApi.dispatch(syncConnect());
  },
});

// syncAddressUpdate: when data acquired from electrum address subscription
export const syncAddressUpdate = createAction("sync/addressUpdate");
syncMiddleware.startListening({
  actionCreator: syncAddressUpdate,
  effect: async (action, listenerApi) => {
    // initial subscription response doesn't have address for context
    if (!Array.isArray(action.payload)) {
      handleSyncAddressInit(action.payload, listenerApi);
      return;
    }

    const AddressManager = new AddressManagerService();
    const [address, addressState] = action.payload;

    // check downloaded state against local state
    if (AddressManager.updateAddressState(address, addressState)) {
      // if state updated, get new utxos, history, balance for address
      console.log("address state changed for", address);
      //listenerApi.dispatch(utxoRequest(address));

      // use local tx history to calculate new state hash
      // if different, we must be missing transactions
      // ask for entire history for address if so

      /*const balance = await Electrum.requestBalance(address);
      const walletBalance = AddressManager.updateAddressBalance(
        address,
        balance
      );*/

      //listenerApi.dispatch(walletBalanceUpdate(walletBalance));
      //listenerApi.dispatch(walletAddressHistoryScan(address));
    }
  },
});

// handle initial response from syncAddressUpdate
function handleSyncAddressInit(payload, listenerApi) {
  const AddressManager = new AddressManagerService();
  // if initial subscription is null, address is unused, so don't proceed
  if (payload !== null) {
    // if we find the address by state, the address is up to date
    const address = AddressManager.getAddressByState(payload);
    if (address === null) {
      // one of our addresses changed while we were offline
      console.log("address update while offline?", address, payload);

      // we don't know which address, so scan them all
      const Electrum = new ElectrumService();
      AddressManager.getReceiveAddresses().forEach(async (address, i) => {
        const addressState = await Electrum.requestAddressState(
          address.address
        );
        console.log("requested address state", i, address, addressState);

        // don't continue scanning if address is unused
        if (addressState !== null) {
          // return up-to-date address state
          listenerApi.dispatch(
            syncAddressUpdate([address.address, addressState])
          );
        }
      });
    }
    // listenerApi.dispatch(walletAddressHistoryScan(address));
    //listenerApi.dispatch(utxoRequest(address.address));
    console.log("address up-to-date", address);
  }
}

const initialState = { connected: false, chaintip: 0 };

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnectionUp, (state, action) => {
      state.connected = true;
    })
    .addCase(syncConnectionDown, (state, action) => {
      state.connected = false;
    });
});

export const selectSyncState = createSelector(
  (state) => state,
  (state) => state.sync
);

/*export const walletAddressHistoryScan = createAction(
  "wallet/addressHistoryScan"
);
syncMiddleware.startListening({
  actionCreator: walletAddressHistoryScan,
  effect: async (action, listenerApi) => {
    const address = action.payload;
    const history = await Electrum.requestAddressHistory(address.address);

    console.log("get_history", address, history);
    const txService = new TransactionService();

    history.forEach(async ({ tx_hash }) => {
      const tx = await Electrum.requestTransaction(tx_hash);
      console.log("requestTransaction", tx_hash, tx);
      txService.registerTransaction(tx, address);
    });
  },
});*/

import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { walletBalanceUpdate } from "@/redux/wallet";
import { utxoRequest } from "@/redux/utxo";

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
      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);
      setTimeout(() =>
        thunkApi.dispatch(
          syncConnect(attempts + 1),
          Math.pow(1000 * attempts, attempts) // exponential backoff
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
    // set up electrum subscriptions
    const AddressManager = new AddressManagerService();
    const addresses = AddressManager.getReceiveAddresses();
    const Electrum = new ElectrumService();
    addresses.forEach(({ address }) => Electrum.subscribeToAddress(address));
  },
});

// syncConnectionDown: fired if electrum connection goes down
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

// syncAddressUpdate: fired when data acquired from address subscription
export const syncAddressUpdate = createAction("sync/addressUpdate");
syncMiddleware.startListening({
  actionCreator: syncAddressUpdate,
  effect: async (action, listenerApi) => {
    // initial subscription response doesn't have address for context
    if (!Array.isArray(action.payload)) {
      return;
    }

    const AddressManager = new AddressManagerService();
    const [address, addressState] = action.payload;

    // check downloaded state against local state
    if (AddressManager.updateAddressState(address, addressState)) {
      // if state updated, get utxos for address
      console.log("address state changed for", address);
      listenerApi.dispatch(utxoRequest(address));

      // use local tx history to calculate new state hash
      // if different, we must be missing transactions
      // ask for entire history for address if so
      //listenerApi.dispatch(walletAddressHistoryScan(address));
    } else {
      console.log("address up-to-date", address);
    }
  },
});

syncMiddleware.startListening({
  actionCreator: utxoRequest.fulfilled,
  effect: async (action, listenerApi) => {
    const { utxos, address } = action.payload;

    // calculate address balance
    const AddressManager = new AddressManagerService();
    const addressBalance = utxos.reduce((sum, cur) => sum + cur.value, 0);
    const walletBalance = AddressManager.updateAddressBalance(
      address,
      addressBalance
    );
    listenerApi.dispatch(walletBalanceUpdate(walletBalance));

    // sync related transactions for utxo
    const txService = new TransactionService();
    const Electrum = new ElectrumService();
    utxos.forEach(async ({ tx_hash }) => {
      let tx = txService.getTransactionByHash(tx_hash);

      if (tx === null) {
        tx = await Electrum.requestTransaction(tx_hash);
        txService.registerTransaction(tx, address);
      }
    });

    console.log("utxoRequest fulfilled", address, utxos);
  },
});

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

    history.forEach(async ({ txid }) => {
      const tx = await Electrum.requestTransaction(txid);
      console.log("requestTransaction", txid, tx);
      txService.registerTransaction(tx, address);
    });
  },
});*/

import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { store } from "@/redux";
import ElectrumService from "@/services/ElectrumService";
import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";

const Electrum = new ElectrumService();

export const walletActivate = createAction("wallet/activate");
export const walletReady = createAction("wallet/ready");
export const walletAddressStateUpdate = createAction("wallet/addressUpdate");

export const walletMiddleware = createListenerMiddleware();

walletMiddleware.startListening({
  actionCreator: walletActivate,
  effect: async (action, listenerApi) => {
    const wallet_id = action.payload;
    console.log("got walletActivate", wallet_id);
    const wallet = await new WalletService().boot(wallet_id);
    listenerApi.dispatch(walletReady(wallet));
  },
});

walletMiddleware.startListening({
  actionCreator: walletReady,
  effect: async (action, listenerApi) => {
    // set up initial address subscriptions
    const addressManager = new AddressManagerService();
    const addresses = addressManager.getReceiveAddresses();
    addresses.forEach((address) => Electrum.subscribeToAddress(address));
  },
});

walletMiddleware.startListening({
  actionCreator: walletAddressStateUpdate,
  effect: async (action, listenerApi) => {
    console.log("walletAddressStateUpdate", action.payload);
    if (!Array.isArray(action.payload)) return;

    const address = action.payload[0];
    const addressState = action.payload[1];

    if (AddressManagerService().updateAddressState(address, addressState)) {
      // get new utxos, history, balance for address
      console.log("address state changed for", address);
    }
  },
});

const initialState = {
  id: 0,
};

export const walletUpdateBalance = createAction("wallet/updateBalance");

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletReady, (state, action) => {
      return action.payload;
    })
    .addCase(walletUpdateBalance, (state, action) => {
      state.balance = action.payload;
    });
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);

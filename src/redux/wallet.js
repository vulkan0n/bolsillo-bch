import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

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
    const addresses = new AddressManagerService(
      listenerApi.getState().wallet.id
    ).getReceiveAddresses();
    addresses.forEach((address) => Electrum.subscribeToAddress(address));
  },
});

walletMiddleware.startListening({
  actionCreator: walletAddressStateUpdate,
  effect: async (action, listenerApi) => {
    console.log("walletAddressStateUpdate", action.payload);
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

import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { setPreference } from "@/redux/preferences";
import { syncConnect, syncSubscribeAddress } from "@/redux/sync";

import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";

export const walletMiddleware = createListenerMiddleware();

// --------------------------------

// walletBoot : initialize/load wallet from preferences.activeWalletId
export const walletBoot = createAction("wallet/boot", (wallet_id) => {
  const wallet = new WalletService().boot(wallet_id);
  return { payload: wallet };
});
walletMiddleware.startListening({
  actionCreator: walletBoot,
  effect: async (action, listenerApi) => {
    console.log("walletBoot", action.payload);
    // connect to electrum
    listenerApi.dispatch(syncConnect());
  },
});

export const walletBalanceUpdate = createAction("wallet/balanceUpdate");
walletMiddleware.startListening({
  actionCreator: walletBalanceUpdate,
  effect: async (action, listenerApi) => {
    const wallet_id = listenerApi.getState().wallet.id;
    const AddressManager = new AddressManagerService(wallet_id);

    // generate new addresses when address state updates
    const generatedAddresses = AddressManager.populateAddresses();

    // subscribe to the new addresses
    generatedAddresses.forEach((address) =>
      listenerApi.dispatch(syncSubscribeAddress(address))
    );
  },
});

const initialState = {
  id: null,
};

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("wallet/boot", (state, action) => {
      return action.payload;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload;
    });
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);

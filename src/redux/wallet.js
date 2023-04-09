import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { setPreference } from "@/redux/preferences";
import { syncConnect } from "@/redux/sync";

import WalletService from "@/services/WalletService";

export const walletMiddleware = createListenerMiddleware();

// --------------------------------

// walletActivate : initialize/load app with wallet_id
export function walletActivate(wallet_id) {
  console.log("walletActivate", wallet_id);
  const wallet = new WalletService().boot(wallet_id);

  return (dispatch, getState) => {
    dispatch(walletReady(wallet));
  };
}

// walletReady: called when wallet is loaded
export const walletReady = createAction("wallet/ready");
walletMiddleware.startListening({
  actionCreator: walletReady,
  effect: async (action, listenerApi) => {
    const wallet = action.payload;

    // save active wallet ID to preferences
    listenerApi.dispatch(
      setPreference({ key: "activeWalletId", value: wallet.id })
    );

    // connect to electrum
    listenerApi.dispatch(syncConnect());
  },
});

export const walletBalanceUpdate = createAction("wallet/balanceUpdate");

const initialState = {
  id: 0,
};

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletReady, (state, action) => {
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

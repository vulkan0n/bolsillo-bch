import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { Preferences } from "@capacitor/preferences";
import WalletService from "@/services/WalletService";

const activeWalletId =
  (await Preferences.get({ key: "activeWalletId" })).value || 1;
const wallet = await new WalletService().boot(activeWalletId);

const initialState = {
  ...wallet,
  balance: wallet.getWalletBalance(),
};

console.log("redux wallet initialState", initialState);

const updateBalance = createAction("wallet/updateBalance");

export const walletReducer = createReducer(initialState, (builder) => {
  console.log("walletReducer initialState", initialState);
  builder
    .addCase(updateBalance, (state, action) => {
      state.balance = action.payload;
    })
    .addDefaultCase((state, action) => {});
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);

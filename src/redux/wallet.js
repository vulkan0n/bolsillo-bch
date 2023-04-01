import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { Preferences } from "@capacitor/preferences";
import WalletService from "@/services/WalletService";

const activateWallet = createAction("wallet/activate");

const activeWalletId =
  (await Preferences.get({ key: "activeWalletId" })).value || 1;
const wallet = await new WalletService().boot(activeWalletId);

const initialState = {
  id: wallet.id,
  balance: wallet.getWalletBalance(),
  cycleAddresses: wallet.getUnusedAddress(5),
  utxos: [], // wallet.getUtxos()?
};

console.log("redux wallet initialState", initialState);

const updateBalance = createAction("wallet/updateBalance");

export const walletReducer = createReducer(initialState, (builder) => {
  builder.addCase(updateBalance, (state, action) => {
    state.balance = action.payload;
  });
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);

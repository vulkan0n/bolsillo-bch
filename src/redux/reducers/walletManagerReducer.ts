import { createSlice } from "@reduxjs/toolkit";
import { SeleneWalletType } from "../../types";

export interface WalletManagerState {
  activeWalletName: string;
  wallets: [SeleneWalletType?];
}

const initialState = {
  activeWalletName: "",
  wallets: [],
} as WalletManagerState;

const walletMangerSlice = createSlice({
  name: "walletManager",
  initialState,
  reducers: {
    addWallet(state, action) {
      state.wallets = state.wallets.push(action.payload.wallet);
    },
    updateActiveWalletName(state, action) {
      state.activeWalletName = action.payload.activeWalletName;
    },
  },
});

export const { addWallet, updateActiveWalletName } = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

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
    updateActiveWallet(state, action) {
      state.activeWalletName = action.payload.activeWalletName;
    },
  },
});

export const { updateActiveWallet } = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

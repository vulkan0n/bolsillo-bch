import { createSlice } from "@reduxjs/toolkit";
import { SeleneWalletType } from "../../types";

const BLANK_SCRATCH_PAD = {
  name: "",
  description: "",
  menemonic: "",
  derivationPath: "",
  cashAddr: "",
};

export interface WalletManagerState {
  activeWalletName: string;
  backupWalletName: string;
  wallets: [SeleneWalletType?];
  scratchPad: {
    name?: string;
    description?: string;
    mnemonic?: string;
    derivationPath?: string;
    cashAddr?: string;
  };
}

const initialState = {
  activeWalletName: "",
  backupWalletName: "",
  wallets: [],
  scratchPad: BLANK_SCRATCH_PAD,
} as WalletManagerState;

const walletMangerSlice = createSlice({
  name: "walletManager",
  initialState,
  reducers: {
    updateActiveWalletName(state, action) {
      state.activeWalletName = action.payload.activeWalletName;
    },
    updateBackupWalletName(state, action) {
      state.backupWalletName = action.payload.backupWalletName;
    },
    updateNewWalletScratchPadName(state, action) {
      state.scratchPad.name = action.payload.name;
    },
    updateNewWalletScratchPadDescription(state, action) {
      state.scratchPad.description = action.payload.description;
    },
    updateNewWalletScratchPadDetails(state, action) {
      state.scratchPad.mnemonic = action.payload.mnemonic;
      state.scratchPad.derivationPath = action.payload.derivationPath;
      state.scratchPad.cashAddr = action.payload.cashAddr;
    },
    addWallet(state) {
      state.wallets = [...state.wallets, { ...state.scratchPad, balance: "0" }];
      state.activeWalletName = state.scratchPad.name;
      state.scratchPad = BLANK_SCRATCH_PAD;
    },
  },
});

export const {
  updateActiveWalletName,
  updateBackupWalletName,
  updateNewWalletScratchPadName,
  updateNewWalletScratchPadDescription,
  updateNewWalletScratchPadDetails,
  addWallet,
} = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

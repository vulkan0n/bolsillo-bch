import { createSlice } from "@reduxjs/toolkit";
import { SeleneWalletType } from "../../types";

const BLANK_SCRATCH_PAD = {
  name: "",
  description: "",
  mnemonic: "",
  derivationPath: "",
  cashAddr: "",
};

export interface WalletManagerState {
  activeWalletName: string;
  navigatedWalletName: string;
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
  navigatedWalletName: "",
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
    updateNavigatedWalletName(state, action) {
      state.navigatedWalletName = action.payload.navigatedWalletName;
    },
    updateNewWalletScratchPadName(state, action) {
      state.scratchPad.name = action.payload.name;
    },
    updateNewWalletScratchPadDescription(state, action) {
      state.scratchPad.description = action.payload.description;
    },
    updateImportWalletScratchPadMnemonic(state, action) {
      state.scratchPad.mnemonic = action.payload.mnemonic;
    },
    updateImportWalletScratchPadDerivationPath(state, action) {
      state.scratchPad.derivationPath = action.payload.derivationPath;
    },
    updateNewWalletScratchPadDetails(state, action) {
      state.scratchPad.mnemonic = action.payload.mnemonic;
      state.scratchPad.derivationPath = action.payload.derivationPath;
      state.scratchPad.cashAddr = action.payload.cashAddr;
    },
    createWalletFromScratchPad(state) {
      state.wallets = [...state.wallets, { ...state.scratchPad, balance: "0" }];
      state.activeWalletName = state.scratchPad.name;
      state.scratchPad = BLANK_SCRATCH_PAD;
    },
    clearWalletScratchPad(state) {
      state.scratchPad = BLANK_SCRATCH_PAD;
    },
    deleteWallet(state, action) {
      state.wallets = state.wallets.filter(
        ({ name }) => name !== action.payload.name
      );
      state.navigatedWalletName = "";
    },
    updateWalletBalance(state, action) {
      const wallet = state.wallets.find(
        ({ name }) => name === action.payload.name
      );
      wallet.balance = action.payload.balance;
    },
    updateWalletCashAddr(state, action) {
      const wallet = state.wallets.find(
        ({ name }) => name === action.payload.name
      );
      wallet.cashAddr = action.payload.cashAddr;
    },
  },
});

export const {
  updateActiveWalletName,
  updateNavigatedWalletName,
  updateNewWalletScratchPadName,
  updateNewWalletScratchPadDescription,
  updateImportWalletScratchPadMnemonic,
  updateImportWalletScratchPadDerivationPath,
  updateNewWalletScratchPadDetails,
  createWalletFromScratchPad,
  clearWalletScratchPad,
  deleteWallet,
  updateWalletBalance,
  updateWalletCashAddr,
} = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

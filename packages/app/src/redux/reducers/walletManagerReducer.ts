import { createSlice } from "@reduxjs/toolkit";
import { SeleneWalletType } from "@selene/common/dist/types";
import { PURGE } from "redux-persist";
import * as R from "ramda";
import { TransactionType } from "../../types";
import { replace } from "immutable-replace";
import { WalletManagerState } from "@selene/common/dist/types/reducers/walletManagerReducer";

const BLANK_SCRATCH_PAD = {
  name: "",
  description: "",
  mnemonic: "",
  derivationPath: "",
  cashaddr: "",
  transactions: [],
};

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
      const lowerCaseMnemonic = action.payload.mnemonic.toLowerCase();
      state.scratchPad.mnemonic = lowerCaseMnemonic;
    },
    updateImportWalletScratchPadDerivationPath(state, action) {
      state.scratchPad.derivationPath = action.payload.derivationPath;
    },
    updateNewWalletScratchPadDetails(state, action) {
      state.scratchPad.mnemonic = action.payload.mnemonic;
      state.scratchPad.derivationPath = action.payload.derivationPath;
      state.scratchPad.cashaddr = action.payload.cashaddr;
    },
    createDefaultWallet(state, action) {
      if (state.wallets.length === 0) {
        const walletName = "My first wallet";
        const newWallet = {
          name: walletName,
          description: "A Bitcoin Cash wallet",
          mnemonic: action.payload.mnemonic,
          derivationPath: action.payload.derivationPath,
          cashaddr: action.payload.cashaddr,
          balance: "0",
          transactions: [],
        };
        state.wallets = [newWallet];
        state.activeWalletName = walletName;
      }
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
      wallet.cashaddr = action.payload.cashaddr;
    },
    importWalletTransactionHistory(state, action) {
      const wallet = state.wallets.find(
        ({ name }) => name === action.payload.name
      );

      const equalByTxHash = R.eqBy(R.prop("txn"));

      const incomingTransactions =
        action.payload.transactionHistory?.transactions;
      const walletTransactions = wallet?.transactions;

      const newTransactions = R.differenceWith(
        equalByTxHash,
        incomingTransactions,
        walletTransactions
      );

      const newTransactionsWithNotes = newTransactions.map((t) => ({
        ...t,
        note: "",
      }));

      const updatedTransactions = walletTransactions.map((w) => {
        const match = incomingTransactions.find((i) => i?.txn === w?.txn);
        const updated = {
          ...w,
          blockheight: match?.blockheight,
        };
        return updated;
      });

      const byHeightDescend = R.descend(R.prop("blockheight"));
      const transactionsByHeight = R.sort(byHeightDescend, updatedTransactions);
      const merged = [...newTransactionsWithNotes, ...transactionsByHeight];
      const replacedWallet = replace(wallet.transactions)
        .with(merged)
        .in(wallet);
      const newWallets = replace(wallet).with(replacedWallet).in(state.wallets);

      state.wallets = newWallets;
    },
    updateTransactionNote(state, action) {
      const inputTransactionHash = action.payload?.txn ?? "";
      const note = action.payload.note;

      const findTxHashInWallet = (wallet: SeleneWalletType): TransactionType =>
        wallet?.transactions?.find(({ txn }) => txn === inputTransactionHash);

      const wallet: SeleneWalletType = state.wallets.find(findTxHashInWallet);
      const transaction: TransactionType = findTxHashInWallet(wallet);
      const newTransaction: TransactionType = {
        ...transaction,
        note,
      };

      const newWallet = replace(transaction).with(newTransaction).in(wallet);
      const newWallets = replace(wallet).with(newWallet).in(state.wallets);

      state.wallets = newWallets;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
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
  createDefaultWallet,
  createWalletFromScratchPad,
  clearWalletScratchPad,
  deleteWallet,
  updateWalletBalance,
  updateWalletCashAddr,
  importWalletTransactionHistory,
  updateTransactionNote,
} = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

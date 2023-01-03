import { createSlice } from "@reduxjs/toolkit";
import {
  SeleneAddressType,
  SeleneWalletType,
} from "@selene-wallet/common/dist/types";
import { PURGE } from "redux-persist";
import * as R from "ramda";
import { TransactionType } from "@selene-wallet/common/dist/types";
import { replace } from "immutable-replace";
import { WalletManagerState } from "@selene-wallet/common/dist/types/reducers/walletManagerReducer";
import { getWalletSatoshiBalance } from "@selene-wallet/app/src/utils/wallet";
import { receiveCoinsEvent } from "@selene-wallet/app/src/utils/wallet/receiveCoins";
import { CoinType } from "@selene-wallet/common/types";

const BLANK_SCRATCH_PAD = {
  name: "",
  description: "",
  mnemonic: "",
  derivationPath: "",
  maxAddressIndex: 0,
  transactions: [],
  addresses: [],
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
      state.scratchPad.maxAddressIndex = action.payload.maxAddressIndex;
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
      state.wallets = [...state.wallets, { ...state.scratchPad }];
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
    updateWalletMaxAddressIndex(state, action) {
      const wallet = state.wallets.find(
        ({ name }) => name === action.payload.name
      );
      wallet.maxAddressIndex = action.payload.maxAddressIndex;
    },
    mergeSeleneAddressToWallet(state, action) {
      const wallet = state.wallets.find(
        ({ name }) => name === action.payload.name
      );

      const existingBalance = getWalletSatoshiBalance(wallet);

      const walletAddresses = wallet?.addresses ?? [];
      const mergedList = [action.payload?.seleneAddress, ...walletAddresses];
      const uniqueList = R.uniqBy(
        (address) => address.hdWalletIndex,
        mergedList
      );
      const orderByAscendingIndex = (a, b) => {
        return a.hdWalletIndex - b.hdWalletIndex;
      };
      const sortedList = R.sort(orderByAscendingIndex, uniqueList);
      wallet.addresses = sortedList;

      const newBalance = getWalletSatoshiBalance(wallet);
      // If balance has increased, then coins were received so trigger coin receive action
      if (newBalance > existingBalance) {
        receiveCoinsEvent();
      }
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
    dropSpentUTXOs(state, action) {
      const spendingWallet: SeleneWalletType = state.wallets.find(
        ({ name }) => name === action.payload.name
      );

      console.log("action.payload.name", action.payload.name);
      console.log({ spendingWallet });
      const walletAddresses: SeleneAddressType[] = spendingWallet.addresses;

      // First update UTXOs submitted to a spend,
      // so drop them from the spending wallet
      const spentUTXOs: CoinType[] = action.payload.spentUTXOs;
      const filteredAddresses = walletAddresses.map((a: SeleneAddressType) => {
        return {
          ...a,
          coins: a.coins.filter((c: CoinType) => {
            const isSpent = R.includes(c, spentUTXOs);
            return !isSpent;
          }),
        };
      });

      const newWallet = replace(walletAddresses)
        .with(filteredAddresses)
        .in(spendingWallet);

      // Second update the change address
      // which has received new utxos and transactions
      const updatedChangeAddress: SeleneAddressType =
        action.payload.updatedChangeAddress;
      const existingChangeAddress = newWallet.addresses.find(
        (a: SeleneAddressType) => a?.cashaddr === updatedChangeAddress.cashaddr
      );
      const newWallet2 = replace(existingChangeAddress)
        .with(updatedChangeAddress)
        .in(newWallet);

      console.log({ existingChangeAddress, updatedChangeAddress });

      // Switch out the original Redux wallet state
      // with the change-address-updated & UTXO-dropped wallet
      const newWallets = replace(spendingWallet)
        .with(newWallet2)
        .in(state.wallets);

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
  updateWalletMaxAddressIndex,
  mergeSeleneAddressToWallet,
  importWalletTransactionHistory,
  updateTransactionNote,
  dropSpentUTXOs,
} = walletMangerSlice.actions;
export default walletMangerSlice.reducer;

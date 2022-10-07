import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import {
  toggleIsBchDenominated,
  updateBitcoinDenomination,
  updateContrastCurrency,
} from "./settingsReducer";
import { updateActiveWalletName } from "./walletManagerReducer";
import { TransactionPadState } from "@selene-wallet/common/dist/types/reducers/transactionPadReducer";

const initialState = {
  view: "Send",
  sendInputView: "Scan",
  padBalance: "0",
  sendToAddress: "",
  isSendingCoins: false,
  error: "",
} as TransactionPadState;

const transactionPadSlice = createSlice({
  name: "transactionPad",
  initialState,
  reducers: {
    updateTransactionPadView(state, action) {
      state.view = action.payload.view;
    },
    updateTransactionPadSendInputView(state, action) {
      state.sendInputView = action.payload.sendInputView;
    },
    updateTransactionPadBalance(state, action) {
      state.padBalance = action.payload.padBalance;
    },
    updateTransactionPadSendToAddress(state, action) {
      state.sendToAddress = action.payload.sendToAddress;
    },
    updateTransactionPadIsSendingCoins(state, action) {
      state.isSendingCoins = action.payload.isSendingCoins;
    },
    updateTransactionPadError(state, action) {
      state.error = action.payload.error;
    },
    clearTransactionPad() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleIsBchDenominated, () => {
        return initialState;
      })
      .addCase(updateContrastCurrency, () => {
        return initialState;
      })
      .addCase(updateBitcoinDenomination, () => {
        return initialState;
      })
      .addCase(updateActiveWalletName, () => {
        return initialState;
      })
      .addCase(PURGE, () => initialState);
  },
});

export const {
  updateTransactionPadView,
  updateTransactionPadSendInputView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
  updateTransactionPadIsSendingCoins,
  updateTransactionPadError,
  clearTransactionPad,
} = transactionPadSlice.actions;
export default transactionPadSlice.reducer;

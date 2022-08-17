import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import {
  toggleIsBchDenominated,
  updateBitcoinDenomination,
  updateContrastCurrency,
} from "./settingsReducer";

export interface TransactionPadState {
  view: "" | "NumPad" | "Send" | "Receive" | "Confirm";
  padBalance: string;
  sendToAddress: string;
  isSendingCoins: boolean;
  error: string;
}

const initialState = {
  view: "NumPad",
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
      .addCase(toggleIsBchDenominated, (state) => {
        return initialState;
      })
      .addCase(updateContrastCurrency, (state) => {
        return initialState;
      })
      .addCase(updateBitcoinDenomination, (state) => {
        return initialState;
      })
      .addCase(PURGE, () => initialState);
  },
});

export const {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
  updateTransactionPadIsSendingCoins,
  updateTransactionPadError,
  clearTransactionPad,
} = transactionPadSlice.actions;
export default transactionPadSlice.reducer;

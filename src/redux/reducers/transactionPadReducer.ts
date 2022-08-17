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
    updateIsSendingCoins(state, action) {
      console.log("updating isSendingCoins", action.payload.isSendingCoins);
      state.isSendingCoins = action.payload.isSendingCoins;
    },
    updateTransactionPadError(state, action) {
      state.error = action.payload.error;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleIsBchDenominated, (state) => {
        state.padBalance = "0";
      })
      .addCase(updateContrastCurrency, (state) => {
        state.padBalance = "0";
      })
      .addCase(updateBitcoinDenomination, (state) => {
        state.padBalance = "0";
      })
      .addCase(PURGE, () => initialState);
  },
});

export const {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
  updateIsSendingCoins,
  updateTransactionPadError,
} = transactionPadSlice.actions;
export default transactionPadSlice.reducer;

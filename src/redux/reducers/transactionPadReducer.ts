import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface TransactionPadState {
  view: "" | "NumPad" | "Send" | "Receive";
  padBalance: string;
  sendToAddress: string;
  error: string;
}

const initialState = {
  view: "NumPad",
  padBalance: "0",
  sendToAddress: "",
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
    updateTransactionPadError(state, action) {
      state.error = action.payload.error;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
  updateTransactionPadError,
} = transactionPadSlice.actions;
export default transactionPadSlice.reducer;

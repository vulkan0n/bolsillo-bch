import { createSlice } from "@reduxjs/toolkit";

export interface TransactionPadState {
  padBalance: string;
  view: "" | "NumPad" | "Send" | "Receive";
  error: string;
}

const initialState = {
  padBalance: "0",
  view: "NumPad",
  error: "",
} as TransactionPadState;

const transactionPadSlice = createSlice({
  name: "transactionPad",
  initialState,
  reducers: {
    updateTransactionPadBalance(state, action) {
      state.padBalance = action.payload.padBalance;
    },
    updateTransactionPadView(state, action) {
      state.view = action.payload.view;
    },
    updateTransactionPadError(state, action) {
      state.error = action.payload.error;
    },
  },
});

export const {
  updateTransactionPadBalance,
  updateTransactionPadView,
  updateTransactionPadError,
} = transactionPadSlice.actions;
export default transactionPadSlice.reducer;

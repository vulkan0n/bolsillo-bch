import { createSlice } from "@reduxjs/toolkit";

interface TransactionPadState {
  padBalance: string;
  view: "" | "Receive";
  error: string;
}

const initialState = {
  padBalance: "0",
  view: "",
  error: "",
} as TransactionPadState;

const transactionPadSlice = createSlice({
  name: "transactionPad",
  initialState,
  reducers: {
    updateTransactionPadBalance(state, action) {
      console.log("updating balance", state);
      state.padBalance = action.payload.padBalance;
    },
    updateTransactionPadView(state, action) {
      console.log("updating view", state);
      state.view = action.payload.view;
    },
    updateTransactionPadError(state, action) {
      console.log("updating error", state);
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

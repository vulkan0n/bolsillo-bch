import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { syncTxAmount } from "@/redux/sync";

import TransactionHistoryService from "@/services/TransactionHistoryService";

const initialState = [];

export const txReducer = createReducer(initialState, (builder) => {
  builder.addCase(syncTxAmount.fulfilled, (state, action) => {
    return new TransactionHistoryService(action.payload).getTransactionHistory();
  });
});

export const selectTransactionHistory = createSelector(
  (state) => state,
  (state) => {
    const txHistory = [...state.transactions];
    txHistory.sort((a, b) =>
      !Number.isInteger(Number.parseInt(a.time)) ||
      !Number.isInteger(Number.parseInt(b.time))
        ? (a.time_seen > b.time_seen) * -1 + (a.time < b.time) * 1
        : (a.time > b.time) * -1 + (a.time < b.time) * 1
    );
    return txHistory;
  }
);

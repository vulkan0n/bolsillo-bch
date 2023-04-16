import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { syncTxRequest } from "@/redux/sync";

import TransactionManagerService from "@/services/TransactionManagerService";

const initialState = [];

export const txReducer = createReducer(initialState, (builder) => {
  builder.addCase(syncTxRequest.fulfilled, (state, action) => {
    return new TransactionManagerService().getTransactionHistory(
      action.payload.wallet_id
    );
  });
});

export const selectTransactionHistory = createSelector(
  (state) => state,
  (state) => {
    const txHistory = [...state.transactions];
    txHistory.sort((a, b) => (a.time > b.time) * -1 + (a.time < b.time) * 1);
    return txHistory;
  }
);

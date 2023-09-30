import { createReducer, createSelector } from "@reduxjs/toolkit";
import { walletBoot } from "@/redux/wallet";
import { syncTxAmount } from "@/redux/sync";

import TransactionHistoryService from "@/services/TransactionHistoryService";

const initialState = [];

export const txReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot, (state, action) => {
      return TransactionHistoryService(
        action.payload
      ).getTransactionHistory();
    })
    .addCase(syncTxAmount.fulfilled, (state, action) => {
      return new TransactionHistoryService(
        action.payload
      ).getTransactionHistory();
    });
});

export const selectTransactionHistory = createSelector(
  (state) => state.transactions,
  (state) => state
);

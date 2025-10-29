/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { selectActiveWalletHash } from "@/redux/wallet";
import { selectCurrencySettings } from "@/redux/preferences";

import LogService from "@/services/LogService";
import TransactionHistoryService from "@/services/TransactionHistoryService";

const Log = LogService("redux/txHistory");

export const DEFAULT_HISTORY_PAGE_LENGTH = 20;

export const txHistoryFetch = createAsyncThunk(
  "txHistory/fetch",
  async (payload, thunkApi) => {
    const walletHash = selectActiveWalletHash(thunkApi.getState());
    const { localCurrency } = selectCurrencySettings(thunkApi.getState());

    const txHistory = await TransactionHistoryService(
      walletHash,
      localCurrency
    ).resolveTransactionHistory(0, DEFAULT_HISTORY_PAGE_LENGTH);

    Log.debug("txHistory resolved", txHistory);

    return txHistory;
  }
);

export const txHistoryFetchMore = createAsyncThunk(
  "txHistory/fetchMore",
  async (payload: number, thunkApi) => {
    const walletHash = selectActiveWalletHash(thunkApi.getState());
    const { localCurrency } = selectCurrencySettings(thunkApi.getState());

    const page = payload;

    const txHistory = await TransactionHistoryService(
      walletHash,
      localCurrency
    ).resolveTransactionHistory(
      page * DEFAULT_HISTORY_PAGE_LENGTH,
      DEFAULT_HISTORY_PAGE_LENGTH
    );

    Log.debug("txHistory fetchMore resolved", txHistory);

    return txHistory;
  }
);

const initialState = {
  history: [],
  hasMore: false,
  total: 0,
  isLoading: false,
};

export const txHistoryReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(txHistoryFetch.pending, (state) => {
      state.history = initialState.history;
      state.hasMore = initialState.hasMore;
      state.total = initialState.total;
      state.isLoading = true;
    })
    .addCase(txHistoryFetch.fulfilled, (state: RootState, action) => {
      state.history = action.payload.transactions;
      state.hasMore = action.payload.hasMore;
      state.total = action.payload.total;
      state.isLoading = false;
    })
    .addCase(txHistoryFetchMore.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(txHistoryFetchMore.fulfilled, (state: RootState, action) => {
      state.history = [...state.history, ...action.payload.transactions];
      state.hasMore = action.payload.hasMore;
      state.total = action.payload.total;
      state.isLoading = false;
    })
    .addCase(txHistoryFetchMore.rejected, (state) => {
      state.isLoading = false;
    });
});

const selectTxHistoryState = (state) => state.txHistory;

export const selectTransactionHistory = createSelector(
  selectTxHistoryState,
  (txHistory) => txHistory.history
);

export const selectTransactionHistoryPagination = createSelector(
  selectTxHistoryState,
  (txHistory) => ({
    hasMore: txHistory.hasMore,
    total: txHistory.total,
    isLoading: txHistory.isLoading,
  })
);

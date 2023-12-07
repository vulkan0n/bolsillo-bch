import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";

import AddressManagerService from "@/services/AddressManagerService";

const initialState = [];

export const addressReducer = createReducer(initialState, (builder) => {
  builder.addCase(walletBoot.fulfilled, (state, action) => {
    const { addresses } = action.payload;
    return addresses;
});

export const selectNewestReceiveAddress = createSelector(
  (state: RootState) => state.addresses[1],
  (receiveAddresses) => receiveAddresses.shift()
);

export const selectNewestChangeAddress = createSelector(
  (state: RootState) => state.addresses[1],
  (changeAddresses) => changeAddresses.shift()
);

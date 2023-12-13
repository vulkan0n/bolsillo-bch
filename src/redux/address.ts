import Logger from "js-logger";
import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { AddressEntity } from "@/services/AddressManagerService";

const initialState = [[], []];

export const addressPopulate =
  createAction<AddressEntity[][]>("address/populate");

export const addressReducer = createReducer(initialState, (builder) => {
  builder.addCase("address/populate", (state, action) => {
    const addresses = action.payload;
    return addresses;
  });
});

export const selectNewestReceiveAddress = createSelector(
  (state: RootState) => state.addresses[0],
  (receiveAddresses) => receiveAddresses.slice(-1)
);

export const selectNewestChangeAddress = createSelector(
  (state: RootState) => state.addresses[1],
  (changeAddresses) => changeAddresses.slice(-1)
);

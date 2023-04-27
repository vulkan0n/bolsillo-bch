// scanner.js
// We moved the ScannerButton isScanning state to redux so that
// @capacitor/App's backButton event listener can be aware of
// whether or not the scanner is open. See main.jsx.
import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";

export const setIsScanning = createAction("scanner/setIsScanning");

const initialState = { isScanning: false };

export const scannerReducer = createReducer(initialState, (builder) => {
  builder.addCase(setIsScanning, (state, action) => {
    state.isScanning = action.payload;
  });
});

export const selectIsScanning = createSelector(
  (state) => state.scanner,
  (scanner) => scanner.isScanning
);

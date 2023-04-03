import { configureStore } from "@reduxjs/toolkit";
import { preferencesReducer, preferencesMiddleware } from "./preferences";
import { walletReducer, walletMiddleware, walletActivate } from "./wallet";
import { utxoReducer } from "./utxo";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    wallet: walletReducer,
    utxo: utxoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(preferencesMiddleware.middleware)
});

store.dispatch(walletActivate(store.getState().preferences.activeWalletId));


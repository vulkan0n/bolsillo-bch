import { configureStore } from "@reduxjs/toolkit";
import { walletReducer, walletMiddleware, walletActivate } from "./wallet";
import { preferencesReducer, preferencesMiddleware } from "./preferences";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(preferencesMiddleware.middleware)
});

store.dispatch(walletActivate(store.getState().preferences.activeWalletId));


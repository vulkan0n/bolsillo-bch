import { configureStore } from "@reduxjs/toolkit";
import { walletReducer, walletMiddleware } from "./wallet";
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

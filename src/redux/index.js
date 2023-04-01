import { configureStore } from "@reduxjs/toolkit";
import { walletReducer } from "./wallet";
import { electrumReducer, electrumMiddleware } from "./electrum";
import { preferencesReducer, preferencesMiddleware } from "./preferences";

export const store = configureStore({
  reducer: {
    electrum: electrumReducer,
    wallet: walletReducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(preferencesMiddleware.middleware)
      .concat(electrumMiddleware.middleware),
});

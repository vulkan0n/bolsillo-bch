import { configureStore } from "@reduxjs/toolkit";
import { preferencesReducer, selectActiveWalletId } from "./preferences";
import { walletReducer, walletMiddleware, walletActivate } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";

export const store = configureStore({
  reducer: {
    sync: syncReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

store.dispatch(walletActivate(selectActiveWalletId(store.getState())));

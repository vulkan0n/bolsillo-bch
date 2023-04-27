import { configureStore } from "@reduxjs/toolkit";
import { preferencesReducer, selectActiveWalletId } from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { txReducer } from "./transactions";
import { scannerReducer } from "./scanner";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    transactions: txReducer,
    scanner: scannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

store.dispatch(walletBoot(selectActiveWalletId(store.getState())));

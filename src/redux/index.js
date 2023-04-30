import { configureStore } from "@reduxjs/toolkit";
import { preferencesReducer, selectActiveWalletId } from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { txReducer } from "./transactions";
import { deviceReducer } from "./device";

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    transactions: txReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

store.dispatch(walletBoot(selectActiveWalletId(store.getState())));

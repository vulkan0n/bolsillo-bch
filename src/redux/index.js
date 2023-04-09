import { configureStore } from "@reduxjs/toolkit";
import {
  preferencesReducer,
  preferencesMiddleware,
  selectActiveWalletId,
} from "./preferences";
import { walletReducer, walletMiddleware, walletActivate } from "./wallet";
import { utxoReducer } from "./utxo";
import { syncReducer, syncMiddleware } from "./sync";

export const store = configureStore({
  reducer: {
    sync: syncReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    utxo: utxoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware)
      .prepend(preferencesMiddleware.middleware),
});

store.dispatch(walletActivate(selectActiveWalletId(store.getState())));

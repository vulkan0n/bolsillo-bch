import { configureStore } from "@reduxjs/toolkit";
import { preferencesReducer, selectActiveWalletId } from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { txReducer } from "./transactions";
import { deviceReducer } from "./device";
import { exchangeRateReducer, fetchExchangeRates } from "./exchangeRates";

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    transactions: txReducer,
    exchangeRates: exchangeRateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

store.dispatch(walletBoot(selectActiveWalletId(store.getState())));
store.dispatch(fetchExchangeRates(store.getState()));

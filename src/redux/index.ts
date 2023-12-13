import { configureStore } from "@reduxjs/toolkit";
import {
  preferencesReducer,
  selectActiveWalletId,
  selectBchNetwork,
} from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { deviceReducer } from "./device";
import { addressReducer } from "./address";
import { exchangeRateReducer, fetchExchangeRates } from "./exchangeRates";
import { triggerCheckIn } from "./stats";

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    exchangeRates: exchangeRateReducer,
    addresses: addressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export function withPayloadType<T>() {
  return (t: T) => ({ payload: t });
}

// run actions needed to fire on app load
export function redux_init() {
  store.dispatch(
    walletBoot({
      wallet_id: selectActiveWalletId(store.getState()),
      network: selectBchNetwork(store.getState()),
    })
  );
  //store.dispatch(fetchExchangeRates());
  //store.dispatch(triggerCheckIn());
}

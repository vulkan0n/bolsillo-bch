import { configureStore } from "@reduxjs/toolkit";
import {
  preferencesReducer,
  selectActiveWalletId,
  selectBchNetwork,
} from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { deviceReducer } from "./device";
import { exchangeRateReducer } from "./exchangeRates";
//import { triggerCheckIn } from "./stats";

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    exchangeRates: exchangeRateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(walletMiddleware.middleware)
      .prepend(syncMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// run actions needed to fire on app load
export function redux_init() {
  store.dispatch(
    walletBoot({
      wallet_id: selectActiveWalletId(store.getState()),
      network: selectBchNetwork(store.getState()),
    })
  );
  //store.dispatch(triggerCheckIn());
}

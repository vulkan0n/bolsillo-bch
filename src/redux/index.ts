import { configureStore, combineReducers } from "@reduxjs/toolkit";
import LogService from "@/kernel/app/LogService";
import {
  preferencesReducer,
  selectActiveWalletHash,
  selectBchNetwork,
  preferencesInit,
} from "./preferences";
import { walletReducer, walletBoot, addressReducer } from "./wallet";
import { syncReducer, syncMiddleware, syncPause, syncResume } from "./sync";
import { deviceReducer, deviceInit } from "./device";
import { txHistoryReducer } from "./txHistory";
import {
  exchangeRateReducer,
  fetchExchangeRates,
  exchangeRateInit,
} from "./exchangeRates";
import { walletConnectReducer, walletConnectInit } from "./walletConnect";
import { triggerCheckIn } from "./stats";

const Log = LogService("redux");

const rootReducer = combineReducers({
  device: deviceReducer,
  preferences: preferencesReducer,
  wallet: walletReducer,
  sync: syncReducer,
  exchangeRates: exchangeRateReducer,
  txHistory: txHistoryReducer,
  addresses: addressReducer,
  walletConnect: walletConnectReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(syncMiddleware.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// initialize redux stores
export async function redux_pre_init() {
  Log.debug("redux_pre_init");
  await store.dispatch(preferencesInit());
  await store.dispatch(deviceInit());
}

// run actions needed to fire on app load
export async function redux_init() {
  Log.debug("redux_init");
  await store.dispatch(exchangeRateInit());
  await store.dispatch(
    walletBoot({
      walletHash: selectActiveWalletHash(store.getState()),
      network: selectBchNetwork(store.getState()),
    })
  );
}

export async function redux_post_init() {
  Log.debug("redux_post_init");
  store.dispatch(walletConnectInit());
  store.dispatch(triggerCheckIn());
  store.dispatch(fetchExchangeRates(0));
}

export async function redux_resume() {
  Log.debug("redux_resume");
  store.dispatch(syncResume());
  store.dispatch(walletConnectInit());
  store.dispatch(triggerCheckIn());
  store.dispatch(fetchExchangeRates(0));
}

export async function redux_pause() {
  Log.debug("redux_pause");
  store.dispatch(syncPause());
}

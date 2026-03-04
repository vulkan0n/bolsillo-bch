import { configureStore, combineReducers, isPlain } from "@reduxjs/toolkit";

import LogService from "@/kernel/app/LogService";
import BcmrService from "@/kernel/bch/BcmrService";

import {
  preferencesReducer,
  selectActiveWalletHash,
  selectBchNetwork,
  preferencesInit,
} from "./preferences";
import { walletReducer, walletBoot, addressReducer } from "./wallet";
import { syncReducer, syncMiddleware, syncPause, syncResume } from "./sync";
import { deviceReducer, deviceInit, selectIsLocked } from "./device";
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
    getDefaultMiddleware({
      serializableCheck: {
        isSerializable: (value: unknown) =>
          typeof value === "bigint" || isPlain(value),
      },
    }).prepend(syncMiddleware.middleware),
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

  const network = selectBchNetwork(store.getState());
  await store.dispatch(
    walletBoot({
      walletHash: selectActiveWalletHash(store.getState()),
      network,
    })
  );

  BcmrService(network).preloadMetadataRegistries();
}

export function redux_resume() {
  if (selectIsLocked(store.getState())) {
    Log.debug("redux_resume blocked by lock screen");
    return;
  }
  Log.debug("redux_resume");
  store.dispatch(syncResume());
  store.dispatch(walletConnectInit());
  store.dispatch(triggerCheckIn());
  store.dispatch(fetchExchangeRates(0));
}

export function redux_pause() {
  Log.debug("redux_pause");
  store.dispatch(syncPause());
}

import { combineReducers, configureStore, isPlain } from "@reduxjs/toolkit";

import LocalNotificationService from "@/kernel/app/LocalNotificationService";
import LogService from "@/kernel/app/LogService";

import { deviceInit, deviceReducer, setScannerIsScanning } from "./device";
import {
  exchangeRateInit,
  exchangeRateReducer,
  fetchExchangeRates,
} from "./exchangeRates";
import {
  preferencesInit,
  preferencesReducer,
  selectActiveWalletHash,
  selectBchNetwork,
} from "./preferences";
import { sendDraftReducer } from "./sendDraft";
import { triggerCheckIn } from "./stats";
import { syncMiddleware, syncPause, syncReducer, syncResume } from "./sync";
import { txHistoryReducer } from "./txHistory";
import {
  addressReducer,
  retryPendingSwap,
  walletBoot,
  walletReducer,
} from "./wallet";
import { walletConnectInit, walletConnectReducer } from "./walletConnect";

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
  sendDraft: sendDraftReducer,
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

  await store.dispatch(
    walletBoot({
      walletHash: selectActiveWalletHash(store.getState()),
    })
  );
}

export function redux_resume() {
  Log.debug("redux_resume");
  store.dispatch(syncResume());
  store.dispatch(walletConnectInit());
  store.dispatch(triggerCheckIn());
  store.dispatch(fetchExchangeRates(0));

  // Retry any pending stablecoin swap after sync reconnects
  setTimeout(() => {
    store.dispatch(retryPendingSwap());
  }, 2000);

  // After sync has time to reconnect and process missed transactions,
  // check if any arrived while the app was paused and fire aggregated notification
  setTimeout(() => {
    const state = store.getState();
    const currentBalance = BigInt(state.wallet.balance);
    LocalNotificationService().checkResumeNotification(currentBalance);
  }, 5000);
}

export function redux_pause() {
  Log.debug("redux_pause");

  // Capture balance snapshot before disconnect for resume notification comparison
  const state = store.getState();
  LocalNotificationService().captureBalanceSnapshot(
    BigInt(state.wallet.balance)
  );

  store.dispatch(setScannerIsScanning(false));
  store.dispatch(syncPause());
}

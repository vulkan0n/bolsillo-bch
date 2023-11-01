import Logger from "js-logger";
import { configureStore } from "@reduxjs/toolkit";
import {
  preferencesReducer,
  selectActiveWalletId,
  selectBchNetwork,
} from "./preferences";
import { walletReducer, walletMiddleware, walletBoot } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { txReducer } from "./transactions";
import { deviceReducer } from "./device";
import { exchangeRateReducer, fetchExchangeRates } from "./exchangeRates";
import { triggerCheckIn } from "./stats";
import { SELENE_WALLET_VERSION } from "@/util/version";

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Run actions needed to fire on app load
function initialize_app() {
  Logger.info(`Selene Wallet v${SELENE_WALLET_VERSION} :: https://selene.cash`);

  const bootPayload = {
    wallet_id: selectActiveWalletId(store.getState()),
    network: selectBchNetwork(store.getState()),
  };
  store.dispatch(walletBoot(bootPayload));
  store.dispatch(fetchExchangeRates(store.getState()));
  store.dispatch(triggerCheckIn());
}

Logger.useDefaults(); // eslint-disable-line react-hooks/rules-of-hooks
initialize_app();

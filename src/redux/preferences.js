import { Preferences } from "@capacitor/preferences";
import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

// TODO: revive "retreivePreferences" method from old commit...
// Still need to restore from device, lol.
const defaultPreferences = {
  activeWalletId: "1",
  localCurrency: "USD",
  preferLocalCurrency: "false",
  hideAvailableBalance: "false",
  denominateSats: "false",
  allowInstantPay: "false",
  instantPayThreshold: "25000000",
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
};

export const setPreference = createAction("preferences/set");
const preferencesUpdated = createAction("preferences/updated");

export const preferencesMiddleware = createListenerMiddleware();

preferencesMiddleware.startListening({
  actionCreator: setPreference,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const payload = {
      key: action.payload.key,
      value: action.payload.value.toString(),
    };
    console.log("prefs update:", payload);
    await Preferences.set(payload);
    listenerApi.dispatch(preferencesUpdated(payload));
  },
});

export const preferencesReducer = createReducer(
  defaultPreferences,
  (builder) => {
    builder.addCase("preferences/updated", (state, action) => {
      state[action.payload.key] = action.payload.value;
    });
  }
);

export const selectPreferences = createSelector(
  (state) => state,
  (state) => state.preferences
);

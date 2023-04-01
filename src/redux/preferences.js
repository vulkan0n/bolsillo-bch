import { useState, useEffect, useRef } from "react";
import { Preferences } from "@capacitor/preferences";
import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

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
    await Preferences.set(action.payload);
    listenerApi.dispatch(preferencesUpdated(action.payload));
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

async function retreivePreferences() {
  //Preferences.clear();
  let keys = (await Preferences.keys()).keys;

  if (keys.length !== Object.keys(defaultPreferences).length) {
    console.log("resetting preferences...");
    keys = Object.keys(defaultPreferences);
    await Preferences.clear();
  }

  const preferences = (
    await Promise.all(
      await keys.map(async (key) => {
        const current = (await Preferences.get({ key })).value;

        if (current === null) {
          await Preferences.set({ key, value: defaultPreferences[key] });
          const newest = (await Preferences.get({ key })).value;
          return { [key]: newest };
        }

        return { [key]: current };
      })
    )
  ).reduce((acc, cur) => {
    return { ...acc, ...cur };
  }, {});

  return { ...preferences };
}

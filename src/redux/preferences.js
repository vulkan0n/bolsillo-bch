import { Preferences } from "@capacitor/preferences";
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { electrum_servers } from "@/util/electrum_servers";

const defaultPreferences = {
  activeWalletId: "1",
  languageCode: "", // Default empty = use device language
  localCurrency: "USD",
  preferLocalCurrency: "false",
  hideAvailableBalance: "false",
  displayExchangeRate: "false",
  denominateSats: "false",
  allowInstantPay: "false",
  instantPayThreshold: "25000000",
  scannerFastMode: "false",
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
  electrumServer: electrum_servers[0],
};

async function retrievePreferences() {
  // Preferences.clear();
  const keys = Object.keys(defaultPreferences);

  const preferences = (
    await Promise.all(
      keys.map(async (key) => {
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
  return preferences;
}

const initialState = await retrievePreferences();

export const setPreference = createAsyncThunk(
  "preferences/set",
  async (payload) => {
    const sanitizedPayload = {
      key: payload.key,
      value: payload.value.toString(),
    };
    await Preferences.set(sanitizedPayload);
    const result = {
      key: sanitizedPayload.key,
      value: (await Preferences.get({ key: sanitizedPayload.key })).value,
    };

    return result;
  }
);

export const preferencesReducer = createReducer(initialState, (builder) => {
  builder.addCase(setPreference.fulfilled, (state, action) => {
    state[action.payload.key] = action.payload.value;
  });
});

export const selectPreferences = createSelector(
  (state) => state,
  (state) => state.preferences
);

export const selectActiveWalletId = createSelector(
  (state) => state,
  (state) => state.preferences.activeWalletId
);

export const selectCurrencySettings = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    localCurrency: preferences.localCurrency,
    preferLocalCurrency: preferences.preferLocalCurrency === "true",
    shouldPreferLocalCurrency: preferences.preferLocalCurrency === "true",
    shouldHideBalance: preferences.hideAvailableBalance === "true",
    shouldDisplayExchangeRate: preferences.displayExchangeRate === "true",
  })
);

// TODO: bits, mBCH
export const selectDenomination = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.denominateSats === "true"
);

export const selectInstantPaySettings = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    isInstantPayEnabled: preferences.allowInstantPay === "true",
    instantPayThreshold: preferences.instantPayThreshold,
  })
);

export const selectLanguageCode = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.languageCode
);

import { Preferences } from "@capacitor/preferences";
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { electrum_servers } from "@/util/electrum_servers";
import { languageList } from "@/util/translations";
import { currencyList } from "@/util/currency";
import { ValidBchNetwork } from "@/util/crypto";

const defaultPreferences = {
  activeWalletId: "1",
  languageCode: languageList[0].code,
  localCurrency: currencyList[0].currency,
  preferLocalCurrency: "false",
  hideAvailableBalance: "false",
  displayExchangeRate: "false",
  denominateSats: "false",
  bchNetwork: "mainnet",
  // --------
  // TODO: make these per-wallet instead of global
  allowInstantPay: "false",
  instantPayThreshold: "10000000",
  instantPayThresholdFiat: "10",
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
  // --------
  // TODO: should these go in db instead?
  electrumServer: electrum_servers[0],
  lastCheckIn: "",
  lastExchangeRate: "1",
  // --------
};

type ValidPreferences = typeof defaultPreferences;

// validatePreferences: ensures loaded preferences object won't lead to broken app state on load
// returns true/false
function validatePreferences(preferences: ValidPreferences): boolean {
  // activeWalletId must be integer
  if (Number.isNaN(Number.parseInt(preferences.activeWalletId, 10))) {
    return false;
  }

  // lastExchangeRate must be numeric
  if (Number.isNaN(Number.parseFloat(preferences.lastExchangeRate))) {
    return false;
  }

  // languageCode must be in list of language codes
  if (!languageList.find((lang) => lang.code === preferences.languageCode)) {
    return false;
  }

  // localCurrency must be in list of currencies
  if (
    !currencyList.find(
      (currency) => currency.currency === preferences.localCurrency
    )
  ) {
    return false;
  }

  // force boolean strings
  const boolKeys = [
    "preferLocalCurrency",
    "hideAvailableBalance",
    "displayExchangeRate",
    "denominateSats",
    "allowInstantPay",
  ];

  const invalidBools = boolKeys.filter(
    (key) => preferences[key] !== "true" && preferences[key] !== "false"
  );

  if (invalidBools.length > 0) {
    return false;
  }

  return true;
}

// cleanupPreferences: removes all unknown/invalid preferences
async function cleanupPreferences(): Promise<void[]> {
  const knownKeys = (await Preferences.keys()).keys;
  const validKeys = Object.keys(defaultPreferences);

  const invalidKeys = knownKeys.filter(
    (known) => validKeys.indexOf(known) === -1
  );

  return Promise.all(
    invalidKeys.map(async (key) => {
      await Preferences.remove({ key });
    })
  );
}

async function retrievePreferences(): Promise<ValidPreferences> {
  // Preferences.clear();

  // remove any unused preferences first
  await cleanupPreferences();

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
  }, {}) as ValidPreferences;

  const isValidPreferences = await validatePreferences(preferences);
  if (!isValidPreferences) {
    Preferences.clear();
    return retrievePreferences();
  }

  return preferences;
}

const initialState = await retrievePreferences();

export const setPreference = createAsyncThunk(
  "preferences/set",
  async (payload: { key: string; value: string }) => {
    // force string value
    const fixedPayload = { ...payload, value: payload.value.toString() };
    await Preferences.set(fixedPayload);

    // ensure redux state stays consistent with device state
    const result = {
      key: payload.key,
      value: (await Preferences.get({ key: payload.key })).value,
    };

    return result;
  }
);

export const resetPreferences = createAsyncThunk(
  "preferences/reset",
  async () => {
    Preferences.clear();
    const preferences = await retrievePreferences();
    return preferences;
  }
);

export const preferencesReducer = createReducer(initialState, (builder) => {
  builder.addCase(setPreference.fulfilled, (state, action) => {
    state[action.payload.key] = action.payload.value;
  });
  builder.addCase(resetPreferences.fulfilled, (state, action) => {
    return action.payload;
  });
});

export const selectPreferences = createSelector(
  (state: RootState) => state,
  (state): ValidPreferences => state.preferences
);

export const selectActiveWalletId = createSelector(
  (state: RootState) => state,
  (state): number => Number.parseInt(state.preferences.activeWalletId, 10)
);

export const selectCurrencySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    localCurrency: preferences.localCurrency,
    shouldPreferLocalCurrency: preferences.preferLocalCurrency === "true",
    shouldHideBalance: preferences.hideAvailableBalance === "true",
    shouldDisplayExchangeRate: preferences.displayExchangeRate === "true",
  })
);

// TODO: bits, mBCH
export const selectDenomination = createSelector(
  (state: RootState) => state.preferences,
  (preferences): string =>
    preferences.denominateSats === "true" ? "sats" : "bch"
);

export const selectInstantPaySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    isInstantPayEnabled: preferences.allowInstantPay === "true",
    instantPayThreshold: preferences.instantPayThreshold,
    instantPayThresholdFiat: preferences.instantPayThresholdFiat,
  })
);

export const selectQrCodeSettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    foreground: preferences.qrCodeForeground,
    background: preferences.qrCodeBackground,
    logo: preferences.qrCodeLogo,
  })
);

export const selectLanguageCode = createSelector(
  (state: RootState) => state.preferences,
  (preferences): string => preferences.languageCode
);

export const selectElectrumServer = createSelector(
  (state: RootState) => state.preferences,
  (preferences): string => preferences.electrumServer
);

export const selectBchNetwork = createSelector(
  (state: RootState) => state.preferences,
  (preferences): ValidBchNetwork => preferences.bchNetwork
);

export const selectIsChipnet = createSelector(
  (state: RootState) => selectBchNetwork(state),
  (bchNetwork): boolean => bchNetwork === "chipnet"
);

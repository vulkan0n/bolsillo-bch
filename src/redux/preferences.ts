import { Preferences } from "@capacitor/preferences";
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { electrum_servers } from "@/util/electrum_servers";
import { languageList } from "@/util/translations";
import { currencyList } from "@/util/currency";

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
  instantPayThreshold: "25000000",
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
  // --------
  // TODO: should these go in db instead?
  electrumServer: electrum_servers[0],
  lastCheckIn: "",
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

  return true;
}

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

  // remove any unused preferences
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
    await Preferences.set(payload);

    // ensure redux state stays consistent with device state
    const result = {
      key: payload.key,
      value: (await Preferences.get({ key: payload.key })).value,
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
    shouldPreferLocalCurrency: preferences.preferLocalCurrency === "true",
    shouldHideBalance: preferences.hideAvailableBalance === "true",
    shouldDisplayExchangeRate: preferences.displayExchangeRate === "true",
  })
);

// TODO: bits, mBCH
export const selectDenomination = createSelector(
  (state) => state.preferences,
  (preferences) => (preferences.denominateSats === "true" ? "sats" : "bch")
);

export const selectInstantPaySettings = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    isInstantPayEnabled: preferences.allowInstantPay === "true",
    instantPayThreshold: preferences.instantPayThreshold,
  })
);

export const selectQrCodeSettings = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    foreground: preferences.qrCodeForeground,
    background: preferences.qrCodeBackground,
    logo: preferences.qrCodeLogo,
  })
);

export const selectLanguageCode = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.languageCode
);

export const selectElectrumServer = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.electrumServer
);

export const selectBchNetwork = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.bchNetwork
);

export const selectIsChipnet = createSelector(
  (state) => selectBchNetwork(state),
  (bchNetwork) => bchNetwork === "chipnet"
);

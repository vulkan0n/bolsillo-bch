import { Preferences } from "@capacitor/preferences";
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { walletBoot } from "@/redux/wallet";

const defaultPreferences = {
  activeWalletId: "1",
  localCurrency: "USD",
  preferLocalCurrency: "false",
  hideAvailableBalance: "false",
  denominateSats: "false",
  allowInstantPay: "false",
  instantPayThreshold: "25000000",
  scannerFastMode: "false",
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
};

async function retrievePreferences() {
  //Preferences.clear();
  let keys = (await Preferences.keys()).keys;
  if (keys.length !== Object.keys(defaultPreferences).length) {
    console.log("resetting preferences...");
    keys = Object.keys(defaultPreferences);
    await Preferences.clear();
  }
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
  async (payload, thunkApi) => {
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

export const selectLocalCurrency = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    preferLocalCurrency: preferences.preferLocalCurrency === "true",
    localCurrency: preferences.localCurrency,
  })
);

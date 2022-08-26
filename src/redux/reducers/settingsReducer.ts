import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { BitcoinDenominationTypes, SupportedCurrencyTypes } from "@types";

export interface SettingsState {
  isBchDenominated: boolean;
  contrastCurrency: SupportedCurrencyTypes;
  bitcoinDenomination: BitcoinDenominationTypes;
  isRightHandedMode: boolean;
  isShowAvailableBalance: boolean;
  isTestNet: boolean;
}

const initialState = {
  isBchDenominated: true,
  contrastCurrency: "usd",
  bitcoinDenomination: "satoshis",
  isRightHandedMode: true,
  isShowAvailableBalance: true,
  isTestNet: false,
} as SettingsState;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleIsBchDenominated(state) {
      state.isBchDenominated = !state.isBchDenominated;
    },
    updateContrastCurrency(state, action) {
      state.contrastCurrency = action.payload.contrastCurrency;
    },
    updateBitcoinDenomination(state, action) {
      state.bitcoinDenomination = action.payload.bitcoinDenomination;
    },
    toggleIsRightHandedMode(state) {
      state.isRightHandedMode = !state.isRightHandedMode;
    },
    toggleIsShowAvailableBalance(state) {
      state.isShowAvailableBalance = !state.isShowAvailableBalance;
    },
    toggleIsTestNet(state) {
      state.isTestNet = !state.isTestNet;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const {
  toggleIsBchDenominated,
  updateContrastCurrency,
  updateBitcoinDenomination,
  toggleIsRightHandedMode,
  toggleIsShowAvailableBalance,
  toggleIsTestNet,
} = settingsSlice.actions;
export default settingsSlice.reducer;

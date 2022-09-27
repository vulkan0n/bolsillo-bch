import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { BitcoinDenominationTypes, SupportedCurrencyTypes } from "@types";
import { BITCOIN_DENOMINATIONS } from "@utils/consts";

export interface SettingsState {
  isBchDenominated: boolean;
  contrastCurrency: SupportedCurrencyTypes;
  bitcoinDenomination: BitcoinDenominationTypes;
  isRightHandedMode: boolean;
  isShowAvailableBalance: boolean;
  isShowCommunityTab: boolean;
  isTestNet: boolean;
}

const initialState = {
  isBchDenominated: true,
  contrastCurrency: "usd",
  bitcoinDenomination: BITCOIN_DENOMINATIONS.satoshis,
  isRightHandedMode: true,
  isShowAvailableBalance: true,
  isShowCommunityTab: true,
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
    toggleIsShowCommunityTab(state) {
      state.isShowCommunityTab = !state.isShowCommunityTab;
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
  toggleIsShowCommunityTab,
  toggleIsTestNet,
} = settingsSlice.actions;
export default settingsSlice.reducer;

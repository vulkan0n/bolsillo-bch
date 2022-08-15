import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface SettingsState {
  isBchDenominated: boolean;
  bitcoinDenomination: "bitcoins" | "millibits" | "bits" | "satoshis";
  isRightHandedMode: boolean;
  isShowAvailableBalance: boolean;
  isTestNet: boolean;
}

const initialState = {
  isBchDenominated: true,
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
  updateBitcoinDenomination,
  toggleIsRightHandedMode,
  toggleIsShowAvailableBalance,
  toggleIsTestNet,
} = settingsSlice.actions;
export default settingsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface SettingsState {
  isCryptoDenominated: boolean;
  isRightHandedMode: boolean;
  isShowAvailableBalance: boolean;
  isTestNet: boolean;
}

const initialState = {
  isCryptoDenominated: true,
  isRightHandedMode: true,
  isShowAvailableBalance: true,
  isTestNet: false,
} as SettingsState;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleIsCryptoDenominated(state) {
      state.isCryptoDenominated = !state.isCryptoDenominated;
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
  toggleIsCryptoDenominated,
  toggleIsRightHandedMode,
  toggleIsShowAvailableBalance,
  toggleIsTestNet,
} = settingsSlice.actions;
export default settingsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

export interface SettingsState {
  isCryptoDenominated: boolean;
  isRightHandedMode: boolean;
  isTestNet: boolean;
}

const initialState = {
  isCryptoDenominated: true,
  isRightHandedMode: true,
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
    toggleIsTestNet(state) {
      state.isTestNet = !state.isTestNet;
    },
  },
});

export const {
  toggleIsCryptoDenominated,
  toggleIsRightHandedMode,
  toggleIsTestNet,
} = settingsSlice.actions;
export default settingsSlice.reducer;

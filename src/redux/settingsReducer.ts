import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  isCryptoDenominated: boolean;
  isTestNet: boolean;
}

const initialState = {
  isCryptoDenominated: true,
  isTestNet: true,
} as SettingsState;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleIsCryptoDenominated(state) {
      state.isCryptoDenominated = !state.isCryptoDenominated;
    },
    toggleIsTestNet(state) {
      state.isTestNet = !state.isTestNet;
    },
  },
});

export const { toggleIsTestNet, toggleIsCryptoDenominated } =
  settingsSlice.actions;
export default settingsSlice.reducer;

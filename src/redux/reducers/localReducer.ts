import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface LocalState {
  lastSentTransactionHash: string;
}

const initialState = {
  lastSentTransactionHash: "",
} as LocalState;

const localSlice = createSlice({
  name: "local",
  initialState,
  reducers: {
    updateLocalLastSentTransactionHash(state, action) {
      state.lastSentTransactionHash = action.payload.lastSentTransactionHash;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateLocalLastSentTransactionHash } = localSlice.actions;
export default localSlice.reducer;

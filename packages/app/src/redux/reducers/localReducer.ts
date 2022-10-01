import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { LocalState } from "@selene/common/dist/types/reducers/localReducer";

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

import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import ElectrumService from "@/services/ElectrumService";

export const utxoRequest = createAsyncThunk(
  "utxo/request",
  async (address, thunkApi) => {
    const Electrum = new ElectrumService();
    const utxos = await Electrum.requestUtxos(address);
    return { address, utxos };
  }
);

const initialState = {};

export const utxoReducer = createReducer(initialState, (builder) => {
  builder.addCase(utxoRequest.fulfilled, (state, action) => {
    state[action.payload.address] = action.payload.utxos;
  });
});

export const selectUtxos = createSelector(
  (state) => state,
  (state) => state.utxos
);

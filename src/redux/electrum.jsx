import {
  createAction,
  createAsyncThunk,
  createReducer,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

const initialState = {
  isConnected: false,
  server: "cashnode.bch.ninja",
  blockheight: 0,
  subscriptions: [],
};

export const electrumMiddleware = createListenerMiddleware();

export const setIsConnected = createAction("wallet/setIsConnected");

export const electrumReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setIsConnected, (state, action) => {
      state.isConnected = action.payload;
    })
    .addDefaultCase((state, action) => {});
});

// TODO: allow user to select electrum server(s)
export const connect = createAsyncThunk("wallet/connect", async () => {
  const electrum = new ElectrumClient(
    "Selene.cash",
    "1.4",
    "cashnode.bch.ninja",
    ElectrumTransport.WSS.Port,
    ElectrumTransport.WSS.Scheme
  );

  return electrum.connect();
});

import {
  createAction,
  createAsyncThunk,
  createReducer,
} from "@reduxjs/toolkit";

import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    default:
      return state;
  }
}

listenerMiddleware.startListening({
  actionCreator: connect

export const setConnectionState = createAction("wallet/setConnectionState");

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

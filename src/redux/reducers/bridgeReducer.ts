import { createSlice } from "@reduxjs/toolkit";
import { WalletType } from "../../types";
import { PURGE } from "redux-persist";

export interface BridgeState {
  wallet: WalletType;
  balance: {
    bch: string;
    usd: string;
    sat: string;
  };
  tempTxId: string;
}

const initialState = {
  wallet: {},
  balance: {
    bch: "0",
    usd: "0",
    sat: "0",
  },
  tempTxId: "",
} as BridgeState;

const bridgeSlice = createSlice({
  name: "bridge",
  initialState,
  reducers: {
    updateBridgeWallet(state, action) {
      state.wallet = action.payload.wallet;
    },
    updateBridgeBalance(state, action) {
      state.balance = action.payload.balance;
    },
    updateBridgeTempTxId(state, action) {
      state.tempTxId = action.payload.tempTxId;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBridgeWallet, updateBridgeBalance, updateBridgeTempTxId } =
  bridgeSlice.actions;
export default bridgeSlice.reducer;

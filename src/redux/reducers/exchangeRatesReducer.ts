import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface ExchangeRatesState {
  audBchPrice: string;
  btcBchPrice: string;
  cadBchPrice: string;
  cnyBchPrice: string;
  ethBchPrice: string;
  eurBchPrice: string;
  gbpBchPrice: string;
  jpyBchPrice: string;
  phpBchPrice: string;
  rubBchPrice: string;
  thbBchPrice: string;
  usdBchPrice: string;
}

const initialState = {
  audBchPrice: "0.00",
  btcBchPrice: "0.000000000",
  cadBchPrice: "0.00",
  cnyBchPrice: "0.00",
  ethBchPrice: "0.000000000",
  eurBchPrice: "0.00",
  gbpBchPrice: "0.00",
  jpyBchPrice: "0.00",
  phpBchPrice: "0.00",
  rubBchPrice: "0.00",
  thbBchPrice: "0.00",
  usdBchPrice: "0.00",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    updateBchPrices(state, action) {
      state.audBchPrice = action.payload.audBchPrice;
      state.btcBchPrice = action.payload.btcBchPrice;
      state.cadBchPrice = action.payload.cadBchPrice;
      state.cnyBchPrice = action.payload.cnyBchPrice;
      state.ethBchPrice = action.payload.ethBchPrice;
      state.eurBchPrice = action.payload.eurBchPrice;
      state.gbpBchPrice = action.payload.gbpBchPrice;
      state.jpyBchPrice = action.payload.jpyBchPrice;
      state.phpBchPrice = action.payload.phpBchPrice;
      state.rubBchPrice = action.payload.rubBchPrice;
      state.thbBchPrice = action.payload.thbBchPrice;
      state.usdBchPrice = action.payload.usdBchPrice;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBchPrices } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

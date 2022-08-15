import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface ExchangeRatesState {
  audBchPrice: string;
  btcBchPrice: string;
  eurBchPrice: string;
  usdBchPrice: string;
}

const initialState = {
  audBchPrice: "0.00",
  btcBchPrice: "0.000000000",
  eurBchPrice: "0.00",
  usdBchPrice: "0.00",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    updateBchPrices(state, action) {
      state.audBchPrice = action.payload.audBchPrice;
      state.btcBchPrice = action.payload.btcBchPrice;
      state.eurBchPrice = action.payload.eurBchPrice;
      state.usdBchPrice = action.payload.usdBchPrice;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBchPrices } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

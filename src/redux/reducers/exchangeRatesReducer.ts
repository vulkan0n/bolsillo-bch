import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface ExchangeRatesState {
  usdBchPrice: string;
  audBchPrice: string;
}

const initialState = {
  usdBchPrice: "0.00",
  audBchPrice: "0.00",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    updateBchPrices(state, action) {
      state.usdBchPrice = action.payload.usdBchPrice;
      state.audBchPrice = action.payload.audBchPrice;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBchPrices } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

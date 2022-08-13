import { createSlice } from "@reduxjs/toolkit";

export interface ExchangeRatesState {
  bchUsdPrice: string;
}

const initialState = {
  bchUsdPrice: "141.16",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {},
});

export default exchangeRatesSlice.reducer;

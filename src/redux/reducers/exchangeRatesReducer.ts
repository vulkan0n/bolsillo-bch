import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

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
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export default exchangeRatesSlice.reducer;

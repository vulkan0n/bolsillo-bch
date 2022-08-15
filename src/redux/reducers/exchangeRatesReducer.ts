import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface ExchangeRatesState {
  bchUsdPrice: string;
  bchAudPrice: string;
}

const initialState = {
  bchUsdPrice: "0.00",
  bchAudPrice: "0.00",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    updateBchPrices(state, action) {
      state.bchUsdPrice = action.payload.bchUsdPrice;
      state.bchAudPrice = action.payload.bchAudPrice;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBchPrices } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

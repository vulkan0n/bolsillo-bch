import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

export interface ExchangeRatesState {
  bchUsdPrice: string;
}

const initialState = {
  bchUsdPrice: "0.00",
} as ExchangeRatesState;

const exchangeRatesSlice = createSlice({
  name: "exchangeRates",
  initialState,
  reducers: {
    updateBchUsdPrice(state, action) {
      state.bchUsdPrice = action.payload.bchUsdPrice;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const { updateBchUsdPrice } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

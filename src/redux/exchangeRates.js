import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import CurrencyService from "@/services/CurrencyService";
import { currencyList } from "@/util/consts/currency";

export const fetchExchangeRates = createAsyncThunk(
  "exchangeRates/fetch",
  async (_, thunkApi) => {
    const Currency = new CurrencyService(
      thunkApi.getState().preferences.localCurrency
    );

    const exchangeRates = await Currency.fetchExchangeRates();
    return exchangeRates;
  }
);

// TODO: persist exchange rates to local DB
const initialState = currencyList.map((currency) => ({
  ...currency,
  price: "1",
}));

export const exchangeRateReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchExchangeRates.fulfilled, (state, action) => {
    return action.payload;
  });
});

export const selectExchangeRates = createSelector(
  (state) => state.exchangeRates,
  (exchangeRates) => exchangeRates
);

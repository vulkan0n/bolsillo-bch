import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { selectCurrencySettings } from "@/redux/preferences";
import CurrencyService from "@/services/CurrencyService";
import { currencyList } from "@/util/currency";

export const fetchExchangeRates = createAsyncThunk(
  "exchangeRates/fetch",
  async (_, thunkApi) => {
    const { localCurrency } = selectCurrencySettings(thunkApi.getState());
    const Currency = CurrencyService(localCurrency);

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

export function stripArsPostDecimal(localCurrency, fiatString) {
  // ARS users prefer not to see irrelevant post decimal values
  if (localCurrency === "ARS" && fiatString.includes(".")) {
    return fiatString?.split(".")?.[0];
  }

  return fiatString;
}

export const selectCurrentPrice = createSelector(
  (state) => ({
    exchangeRates: state.exchangeRates,
    currency: state.preferences.localCurrency,
    locale: state.device.locale,
  }),
  (s) => {
    const relevantCurrency = s.exchangeRates.find(
      (e) => e.currency === s.currency
    );
    const price = relevantCurrency?.price || "0";
    const priceString = `${Number(price).toLocaleString(s.locale, {
      style: "currency",
      currency: s.currency,
    })}`;

    const adjustedPriceString = stripArsPostDecimal(s.currency, priceString);

    return { price: adjustedPriceString, currency: s.currency };
  }
);

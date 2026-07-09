/* eslint-disable @typescript-eslint/no-use-before-define */
import { Preferences } from "@capacitor/preferences";
import {
  createAsyncThunk,
  createReducer,
  createSelector,
} from "@reduxjs/toolkit";
import Logger from "js-logger";

import {
  selectCurrencySettings,
  selectIsOfflineMode,
  setPreference,
} from "@/redux/preferences";

import LogService from "@/kernel/app/LogService";
import CurrencyService from "@/kernel/bch/CurrencyService";

import { currencyList } from "@/util/currency";

interface ExchangeRateItem {
  currency: string;
  countryCode: string;
  symbol: string;
  decimals?: number;
  price: string;
}

interface ExchangeRatesState {
  rates: ExchangeRateItem[];
  lastUpdatedAt: number | null;
}

const Log = LogService("redux/exchangeRates");

export const fetchExchangeRates = createAsyncThunk(
  "exchangeRates/fetch",
  // eslint-disable-next-line @typescript-eslint/default-param-last
  async (attempts: number = 0, thunkApi) => {
    const storedRates = selectExchangeRates(thunkApi.getState());
    const storedFull = (thunkApi.getState() as any).exchangeRates;

    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.debug("exchangeRates/fetch blocked by offline mode");
      return {
        rates: storedRates,
        lastUpdatedAt: storedFull?.lastUpdatedAt ?? null,
      };
    }

    const { localCurrency } = selectCurrencySettings(thunkApi.getState());
    const Currency = CurrencyService(localCurrency);

    try {
      const fetchedExchangeRates = await Currency.fetchExchangeRates();

      // persist exchange rate
      // TODO #423: save exchange rates per block
      const currentPrice = Currency.getExchangeRate(
        localCurrency,
        fetchedExchangeRates
      );
      thunkApi.dispatch(
        setPreference({
          key: "lastExchangeRate",
          value: currentPrice,
        })
      );

      const now = Date.now();
      await Preferences.set({
        key: "lastExchangeRateTimestamp",
        value: String(now),
      });

      return {
        rates: fetchedExchangeRates,
        lastUpdatedAt: now,
      };
    } catch (e) {
      Logger.error("fetchExchangeRates failed", e);
      setTimeout(
        () => thunkApi.dispatch(fetchExchangeRates(attempts + 1)),
        30000 * (attempts + 1)
      );
      return {
        rates: storedRates,
        lastUpdatedAt: storedFull?.lastUpdatedAt ?? null,
      };
    }
  }
);

export const exchangeRateInit = createAsyncThunk(
  "exchangeRate/init",
  async () => {
    const lastExchangeRate =
      (await Preferences.get({ key: "lastExchangeRate" })).value || "1";
    const lastUpdatedAtStr = (
      await Preferences.get({ key: "lastExchangeRateTimestamp" })
    ).value;

    const rates = currencyList.map((currency) => ({
      ...currency,
      price: lastExchangeRate,
    }));

    Log.debug("lastExchangeRate", lastExchangeRate);
    return {
      rates,
      lastUpdatedAt: lastUpdatedAtStr ? Number(lastUpdatedAtStr) : null,
    };
  }
);

const initialState: ExchangeRatesState = {
  rates: currencyList.map((currency) => ({
    ...currency,
    price: "1",
  })),
  lastUpdatedAt: null,
};

export const exchangeRateReducer = createReducer(
  initialState as ExchangeRatesState,
  (builder) => {
    builder
      .addCase(fetchExchangeRates.fulfilled, (_state, action) => {
        return {
          rates: action.payload.rates,
          lastUpdatedAt: action.payload.lastUpdatedAt,
        } as ExchangeRatesState;
      })
      .addCase(exchangeRateInit.fulfilled, (_state, action) => {
        return {
          rates: action.payload.rates,
          lastUpdatedAt: action.payload.lastUpdatedAt,
        } as ExchangeRatesState;
      });
  }
);

export const selectExchangeRates = createSelector(
  (state) => state,
  (state) => state.exchangeRates.rates
);

export const selectLastUpdatedAt = createSelector(
  (state) => state,
  (state) => state.exchangeRates.lastUpdatedAt
);

export function stripArsPostDecimal(localCurrency, fiatString) {
  // ARS users prefer not to see irrelevant post decimal values
  if (localCurrency === "ARS" && fiatString.includes(".")) {
    return fiatString.split(".")[0];
  }

  return fiatString;
}

export const selectCurrentPrice = createSelector(
  (state) => state,
  (state) => {
    const s = {
      exchangeRates: selectExchangeRates(state),
      currency: state.preferences.localCurrency,
      locale: state.device.locale,
    };

    const relevantCurrency = s.exchangeRates.find(
      (e) => e.currency === s.currency
    );
    const price = relevantCurrency?.price || "1";

    const priceString = `${Number(price).toLocaleString(s.locale, {
      style: "currency",
      currency: s.currency,
    })}`;

    return { price, priceString, currency: s.currency };
  }
);

export const selectCurrentPriceString = createSelector(
  (state) => selectCurrentPrice(state),
  (priceData) => priceData.priceString
);

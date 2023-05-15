import { bchToSats, satsToBch } from "@/util/sats";
import { Decimal } from "decimal.js";
import { currencyList } from "@/util/currency";
import { selectExchangeRates } from "@/redux/exchangeRates";
import { store } from "@/redux";

export default function CurrencyService(fiatCurrency) {
  return {
    fiatToSats,
    fiatToBch,
    satsToFiat,
    getExchangeRate,
    getSymbol,
    fetchExchangeRates,
  };

  async function fetchExchangeRates() {
    // https://www.coingecko.com/en/api/documentation
    const coingeckoUrl = "https://api.coingecko.com";

    const currencies = encodeURI(
      currencyList.map((currency) => currency.currency).join(",")
    );

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=${currencies}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(response);
      }

      const json = await response.json();
      const data = json["bitcoin-cash"];

      const rates = currencyList.map((currency) => ({
        ...currency,
        price: data[currency.currency.toLowerCase()].toString(),
      }));

      return rates;
    } catch (e) {
      console.error(e);
    }
  }

  function fiatToSats(fiatAmount) {
    const bchAmount = new Decimal(1)
      .div(getExchangeRate(fiatCurrency))
      .times(fiatAmount);

    return bchToSats(bchAmount);
  }

  function fiatToBch(fiatAmount) {
    return new Decimal(satsToBch(fiatToSats(fiatAmount))).toFixed(8).toString();
  }

  function satsToFiat(sats) {
    return new Decimal(satsToBch(sats))
      .times(getExchangeRate(fiatCurrency))
      .toFixed(2)
      .toString();
  }

  function getExchangeRate(currency) {
    const exchangeRates = selectExchangeRates(store.getState());
    const index = exchangeRates.findIndex(
      (exchangeRate) => exchangeRate.currency === currency
    );

    return index > -1 ? exchangeRates[index].price : null;
  }

  function getSymbol(currency) {
    const index = currencyList.findIndex(
      (exchangeRate) => exchangeRate.currency === currency
    );

    return index > -1 ? currencyList[index].symbol : null;
  }
}

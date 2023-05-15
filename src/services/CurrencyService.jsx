import { bchToSats, satsToBch } from "@/util/sats";
import { Decimal } from "decimal.js";
import { currencyList } from "@/util/currency";

export default function CurrencyService(fiatCurrency) {
  const exchangeRates = currencyList.map((currency) => ({
    ...currency,
    price: "119.42",
  }));

  return {
    fiatToSats,
    fiatToBch,
    satsToFiat,
    getExchangeRate,
    getSymbol,
  };

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
    const index = exchangeRates.findIndex(
      (exchangeRate) => exchangeRate.currency === currency
    );

    return index > -1 ? exchangeRates[index].price : null;
  }

  function getSymbol(currency) {
    const index = exchangeRates.findIndex(
      (exchangeRate) => exchangeRate.currency === currency
    );

    return index > -1 ? exchangeRates[index].symbol : null;
  }
}

import { bchToSats, satsToBch } from "@/util/sats";
import { Decimal } from "decimal.js";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";

export default function FiatOracleService() {
  const preferences = selectPreferences(store.getState());

  const oracles = [{ currency: "USD", price: "119.42", symbol: "$" }];

  return {
    toSats,
    toBch,
    toFiat,
    getOracles,
    getSymbol
  };

  function toSats(amount) {
    return bchToSats(
      new Decimal(1 / getExchangeRate(preferences["localCurrency"])).times(
        amount
      )
    );
  }

  function toBch(amount) {
    return new Decimal(satsToBch(toSats(amount))).toFixed(8).toString();
  }

  function toFiat(sats) {
    return new Decimal(satsToBch(sats))
      .times(getExchangeRate(preferences["localCurrency"]))
      .toFixed(2)
      .toString();
  }

  function getOracles() {
    return oracles;
  }

  function getExchangeRate(currency) {
    const oracleIndex = oracles.findIndex(
      (oracle) => (oracle.currency = currency)
    );

    return oracleIndex > -1 ? oracles[oracleIndex].price : null;
  }

  function getSymbol(currency) {
    const oracleIndex = oracles.findIndex(
      (oracle) => (oracle.currency = currency)
    );

    return oracleIndex > -1 ? oracles[oracleIndex].symbol : null;
  }

}

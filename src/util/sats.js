import { Decimal } from "decimal.js";
import { selectLocale } from "@/redux/device";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";
import CurrencyService from "@/services/CurrencyService";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000).toString();
export const DUST_LIMIT = 546; // 3 * minRelayFee (currently 1000 sat/kB on most nodes)

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toDecimalPlaces(8, Decimal.ROUND_DOWN);
}

export function bchToSats(bch) {
  return new Decimal(bch)
    .mul(SATOSHI)
    .toDecimalPlaces(0, Decimal.ROUND_DOWN)
    .toString();
}

export function formatSatoshis(amount) {
  const locale = selectLocale(store.getState());
  const preferences = selectPreferences(store.getState());

  const currency = preferences["localCurrency"];
  const preferLocal = preferences["preferLocalCurrency"] === "true";
  const denominateSats = preferences["denominateSats"] === "true";
  const hideBalance = preferences["hideAvailableBalance"] === "true";

  const Currency = new CurrencyService(currency);

  const bchSymbol = denominateSats ? "" : "₿";
  const bchUnit = denominateSats ? "sats" : "BCH";
  const bchAmount = denominateSats ? amount : satsToBch(amount);

  const bchDisplay =
    amount < 0
      ? `-${bchSymbol}${Math.abs(bchAmount)} ${bchUnit}`
      : `${bchSymbol}${bchAmount} ${bchUnit}`;

  const fiatAmount = `${new Number(Currency.satsToFiat(amount)).toLocaleString(
    locale,
    { style: "currency", currency }
  )}`;

  const displayAmount = {
    bch: bchDisplay,
    fiat: fiatAmount,
  };

  const displayHidden = {
    bch: bchDisplay.replace(/\d/g, "X"),
    fiat: fiatAmount.replace(/\d/g, "X"),
  };

  return hideBalance ? displayHidden : displayAmount;
}

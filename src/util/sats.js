import { Decimal } from "decimal.js";
import { selectLocale } from "@/redux/device";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";
import CurrencyService from "@/services/CurrencyService";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000).toString();
export const DUST_LIMIT = 546; // 3 * minRelayFee (currently 1000 sat/kB on most nodes)

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toFixed(8, Decimal.ROUND_DOWN);
}

export function bchToSats(bch) {
  return new Decimal(bch)
    .mul(SATOSHI)
    .toDecimalPlaces(0, Decimal.ROUND_DOWN)
    .toString();
}

export function formatSatoshis(amount, bypassHidden = false) {
  // Can't check for !amount because amount maybe === 0
  if (amount === null || amount === undefined) {
    return {
      bch: "-",
      fiat: "-",
    };
  }

  const locale = selectLocale(store.getState());
  const preferences = selectPreferences(store.getState());

  const currency = preferences["localCurrency"];
  const denominateSats = preferences["denominateSats"] === "true";
  const hideBalance = preferences["hideAvailableBalance"] === "true";

  const Currency = new CurrencyService(currency);

  const bchSymbol = denominateSats ? "" : "₿";
  const bchUnit = denominateSats ? "sats" : "BCH";
  const absoluteSatsAmount = Math.abs(amount);
  const absoluteBchAmount = denominateSats
    ? absoluteSatsAmount
    : satsToBch(absoluteSatsAmount);

  const bchDisplay =
    amount < 0
      ? `-${bchSymbol}${absoluteBchAmount} ${bchUnit}`
      : `${bchSymbol}${absoluteBchAmount} ${bchUnit}`;

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

  return hideBalance && !bypassHidden ? displayHidden : displayAmount;
}

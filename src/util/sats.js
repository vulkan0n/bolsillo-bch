import { Decimal } from "decimal.js";
import { selectLocale } from "@/redux/device";
import { selectPreferences, selectLocalCurrency } from "@/redux/preferences";
import { store } from "@/redux";
import CurrencyService from "@/services/CurrencyService";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000).toString();
export const DUST_LIMIT = 546; // 3 * minRelayFee (currently 1000 sat/kB on most nodes)

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toFixed(8, Decimal.ROUND_DOWN);
}

export function bchToSats(bch) {
  const sats = new Decimal(bch)
    .mul(SATOSHI)
    .toDecimalPlaces(0, Decimal.ROUND_DOWN);
  return sats;
}

export function satsToDisplayAmount(sats) {
  const preferences = selectPreferences(store.getState());
  const { preferLocalCurrency, localCurrency } = selectLocalCurrency(
    store.getState()
  );
  const Currency = new CurrencyService(localCurrency);

  const denominateSats = preferences.denominateSats === "true";

  if (new Decimal(sats).equals(0)) {
    return "0";
  }

  if (preferLocalCurrency) {
    return Currency.satsToFiat(sats);
  }

  if (denominateSats) {
    return sats;
  }

  return satsToBch(sats);
}

export function stripArsPostDecimal(localCurrency, fiatString) {
  // ARS users prefer not to see irrelevant post decimal values
  if (localCurrency === "ARS" && fiatString.includes(".")) {
    return fiatString?.split(".")?.[0];
  }

  return fiatString;
}

export function formatSatoshis(amount) {
  // Can't check for !amount because amount maybe === 0
  if (amount === null || amount === undefined) {
    return {
      bch: "-",
      fiat: "-",
    };
  }

  const locale = selectLocale(store.getState());
  const preferences = selectPreferences(store.getState());

  const { localCurrency } = selectLocalCurrency(store.getState());
  const denominateSats = preferences.denominateSats === "true";
  const hideBalance = preferences.hideAvailableBalance === "true";

  const Currency = new CurrencyService(localCurrency);

  const bchSymbol = denominateSats ? "" : "₿";
  const bchUnit = denominateSats ? "sats" : "";
  const absoluteSatsAmount = Math.abs(amount);
  const absoluteBchAmount = denominateSats
    ? absoluteSatsAmount
    : satsToBch(absoluteSatsAmount);

  const sign = amount < 0 ? "-" : "";
  const bchDisplay =
    `${sign}${bchSymbol}${absoluteBchAmount} ${bchUnit}`.trim();

  /* eslint-disable no-new-wrappers */
  const fiatDisplay = `${new Number(Currency.satsToFiat(amount)).toLocaleString(
    locale,
    {
      style: "currency",
      currency: localCurrency,
    }
  )}`;

  const displayAmount = {
    bch: bchDisplay,
    fiat: stripArsPostDecimal(localCurrency, fiatDisplay),
    sign,
  };

  // Don't leak number of digits when hiding balance
  const displayHidden = {
    bch: "XXXXXXXXXX",
    fiat: "XXXXXXXXXX",
    sign: "",
  };

  return hideBalance ? displayHidden : displayAmount;
}

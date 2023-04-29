import { Decimal } from "decimal.js";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000).toString();
export const DUST_LIMIT = 546; // "effectively" 3 * 1000 sat/kB" due to minRelayFee... why 1/3 ratio? maybe CHIP this.

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toDecimalPlaces(8, Decimal.ROUND_DOWN);
}

export function bchToSats(bch) {
  return new Decimal(bch)
    .mul(SATOSHI)
    .toDecimalPlaces(0, Decimal.ROUND_DOWN)
    .toString();
}

export function formatSatoshis(sats) {
  const preferences = selectPreferences(store.getState());
  const denominateSats = preferences["denominateSats"] === "true";
  const formatted = denominateSats
    ? `${sats} sats`
    : `${(sats / SATOSHI).toFixed(8, Decimal.ROUND_DOWN)} BCH`;

  return formatted;
}

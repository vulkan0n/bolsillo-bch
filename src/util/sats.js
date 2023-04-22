import { Decimal } from "decimal.js";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000);
export const DUST_LIMIT = 546; // "effectively" 3 * 1000 sat/kB" due to minRelayFee... why 1/3 ratio? maybe CHIP this.

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toString();
}

export function bchToSats(bch) {
  return new Decimal(bch).mul(SATOSHI).toString();
}

export function formatSatoshis(sats) {
  const preferences = selectPreferences(store.getState());
  const denominateSats = preferences["denominateSats"] === "true";
  const formatted = denominateSats
    ? `${sats} sats`
    : `${(sats / SATOSHI).toFixed(8)} BCH`;

  return formatted;
}

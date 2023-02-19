import { Decimal } from "decimal.js";

export const SATOSHI = 100000000; // sats per BCH
export const DUST_LIMIT = 547;

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toString();
}

export function bchToSats(bch) {
  return new Decimal(bch).mul(SATOSHI).toString();
}

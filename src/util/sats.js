import { Decimal } from "decimal.js";

export const SATOSHI = 100000000; // sats per 1 BCH
export const DUST_LIMIT = 546; // "effectively" 3 * 1000 sat/kB" due to minRelayFee... why 1/3 ratio? maybe CHIP this.

export function satsToBch(sats) {
  return new Decimal(sats).div(SATOSHI).toString();
}

export function bchToSats(bch) {
  return new Decimal(bch).mul(SATOSHI).toString();
}

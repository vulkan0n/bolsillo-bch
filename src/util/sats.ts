import { Decimal } from "decimal.js";
import { excessiveSatoshis, binToValueSatoshis } from "@bitauth/libauth";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = BigInt(SATOSHI) * 21000000n;
export const EXCESSIVE_SATOSHIS = binToValueSatoshis(excessiveSatoshis);
export const DUST_RELAY_FEE = 1000n; // minRelayFee in sats per kB (generally 1000 sat/kB on most nodes)
export const DUST_LIMIT = 546n;
export const VALID_DENOMINATIONS = ["BCH", "mBCH", "bits", "sats"];

export function satsToBch(sats: bigint | string | number | Decimal): {
  sats: bigint;
  bch: number;
  mbch: number;
  bits: number;
} {
  return {
    sats: BigInt(new Decimal(sats).toString()),
    bch: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).toFixed(8, Decimal.ROUND_DOWN)
    ),
    mbch: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).mul(1000).toFixed(5, Decimal.ROUND_DOWN)
    ),
    bits: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).mul(1000000).toFixed(2, Decimal.ROUND_DOWN)
    ),
  };
}

export function bchToSats(bch, denomination = "bch"): bigint {
  switch (denomination) {
    case "sats":
    case "token":
      return BigInt(bch.toString());

    case "mbch":
      return BigInt(
        new Decimal(bch)
          .div(1000)
          .mul(SATOSHI)
          .toDecimalPlaces(0, Decimal.ROUND_DOWN)
          .toString()
      );

    case "bits":
      return BigInt(
        new Decimal(bch)
          .div(1000000)
          .mul(SATOSHI)
          .toDecimalPlaces(0, Decimal.ROUND_DOWN)
          .toString()
      );

    case "bch":
    default:
      return BigInt(
        new Decimal(bch)
          .mul(SATOSHI)
          .toDecimalPlaces(0, Decimal.ROUND_DOWN)
          .toString()
      );
  }
}

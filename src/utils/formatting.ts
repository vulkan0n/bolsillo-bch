import { convertSatsToUsd } from "./exchangeRates";
import { useSelector } from "react-redux";
import { BitcoinDenominationTypes, ReduxState } from "../types";
import {
  MAIN_NET_PREFIX,
  TEST_NET_PREFIX,
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "./consts";

// Split string into groups of 3 characters, starting from right side
// https://stackoverflow.com/a/63716019
function chunkRight(str, size = 3) {
  if (typeof str === "string") {
    const length = str.length;
    const chunks = Array(Math.ceil(length / size));
    if (length) {
      chunks[0] = str.slice(0, length % size || size);
      for (let i = 1, index = chunks[0].length; index < length; i++) {
        chunks[i] = str.slice(index, (index += size));
      }
    }
    return chunks;
  }
}

export const chunkPreDecimalInto3s = (value: string): string => {
  // Split pre-decimal number into chunks of 3, starting from right
  const splitString = value.split(".");
  const preDecimal = chunkRight(splitString?.[0]).join(" ");
  const postDecimal = splitString?.[1];

  if (!postDecimal) {
    return `${preDecimal}`;
  }

  return `${preDecimal}.${postDecimal}`;
};

export const padBalanceToBchDisplay = (
  padBalance: string,
  bitcoinDenomination: BitcoinDenominationTypes
): string => {
  const finalValue = prettifyRawCurrencyValue(padBalance, bitcoinDenomination);
  console.log({ padBalance, bitcoinDenomination, finalValue });
  return finalValue;
};

export const prettifyRawCurrencyValue = (
  value: string,
  currency: string
): string => {
  const rawValue = value ?? "0";
  const chunkedValue = chunkPreDecimalInto3s(rawValue);

  switch (currency) {
    case "usd":
      return `USD $${chunkedValue}`;
    case "aud":
      return `AUD $${chunkedValue}`;
    case "bitcoins":
      return `₿ ${chunkedValue} BCH`;
    case "millibits":
      return `₿ ${chunkedValue} mBCH`;
    case "bits":
      return `₿ ${chunkedValue} bits`;
    case "satoshis":
      return `₿ ${chunkedValue} sats`;
    default:
      return chunkedValue;
  }
};

export const displayUsd = (value: string): string => {
  if (!value) {
    return "USD $0.00";
  }

  // 2 decimal places, rounding down
  const decimalised = (Math.floor(parseFloat(value) * 100) / 100).toFixed(2);
  const chunkedRawValue = chunkPreDecimalInto3s(decimalised.toString());
  return prettifyRawCurrencyValue(chunkedRawValue, "usd");
};

export const displaySats = (sats: string): string => {
  if (!sats) {
    return "₿ 0 sats";
  }

  const floatSats = parseFloat(sats);
  // i.e. '1 000 120' not `1000120`
  const spacedChunks = chunkRight(floatSats.toString()).join(" ");

  return `₿ ${spacedChunks} sats`;
};

export const displaySatsInDenomination = (
  sats: string,
  denomination: string
): string => {
  switch (denomination) {
    case "bitcoins":
      const bitcoinRawValue = `${parseFloat(sats) / ONE_HUNDRED_MILLION}`;
      return prettifyRawCurrencyValue(bitcoinRawValue, "bitcoins");
    case "millibits":
      const millibitsRawValue = `${parseFloat(sats) / ONE_HUNDRED_THOUSAND}`;
      return prettifyRawCurrencyValue(millibitsRawValue, "millibits");
    case "bits":
      return `₿ ${parseFloat(sats) / ONE_HUNDRED} bits`;
    case "satoshis":
      return prettifyRawCurrencyValue(sats, "satoshis");
    default:
      return displaySats(sats);
  }
};

export const displaySatsAsUsd = (sats: string): string => {
  return displayUsd(convertSatsToUsd(sats));
};

export const formatStringToCashAddress = (
  string: string,
  isTestNet: boolean = false
): string => {
  const isPrefix =
    (isTestNet && string.includes(TEST_NET_PREFIX)) ||
    (!isTestNet && string.includes(MAIN_NET_PREFIX));
  const prefix = isTestNet ? TEST_NET_PREFIX : MAIN_NET_PREFIX;
  const address = string.trim().toLowerCase();
  return `${isPrefix ? "" : prefix}${address}`;
};

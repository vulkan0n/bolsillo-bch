import {
  convertRawUsdToSats,
  convertRawSatsToRawBch,
  convertRawSatsToRawUsd,
  convertRawSatsToRawAud,
} from "./exchangeRates";
import { useSelector } from "react-redux";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SupportedCurrency,
} from "../types";
import {
  MAIN_NET_PREFIX,
  TEST_NET_PREFIX,
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "./consts";

// Note on how this file works
// All values are passed between functions as strings

// Decimal places depend on the convention of the denomination/currency
// I.e. usd = 2dp, aud = 2dp
// satoshis = 0dp, bits = 2dp,
// milliibts = 5dp, bitcoins = 8dp

// padBalance is the string the user has typed into the NumPad
// It may or may not have a decimal place, and may or may not have
// trailing values if so
// The user expectation of what denomination or currency they are
// typing in and how many decimals it can have also varies
// according to their setting
// E.g. "100345.1" (bits)

// rawSats is an integer-style string with no max length
// (There are 21 quadrillion satoshis possible on the BCH blockchain)
// E.g. "10034510" (satoshis)

// rawValue is a correctly decimalised representation of the currency
// E.g. "100345.10" (bits)

// chunkedValue is rawValue, but with pre-decimal amount
// spaced in groups of 3
// E.g. "100 345.10" (bits)

// prettyValue is chunkedValue, but wrapped with currency symbol
// prefix and suffix
// E.g. "₿ 100 345.10 bits"

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

export const convertPadBalanceToRawSats = (
  padBalance: string,
  currency: SupportedCurrency | BitcoinDenominationTypes
): string => {
  switch (currency) {
    // case "usd":
    //   return convertRawUsdToSats(`${parseFloat(padBalance)}`);
    case "bitcoins":
      return `${parseFloat(padBalance) * ONE_HUNDRED_MILLION}`;
    case "millibits":
      return `${parseFloat(padBalance) * ONE_HUNDRED_THOUSAND}`;
    case "bits":
      return `${parseFloat(padBalance) * ONE_HUNDRED}`;
    case "satoshis":
      return padBalance;
    default:
      return padBalance;
  }
};

export const convertRawSatsToRawCurrency = (
  rawSats: string,
  currency: SupportedCurrency | BitcoinDenominationTypes
): string => {
  switch (currency) {
    case "usd":
      return convertRawSatsToRawUsd(rawSats);
    case "aud":
      return convertRawSatsToRawAud(rawSats);
    case "bitcoins":
      return convertRawSatsToRawBch(rawSats);
    case "millibits":
      return `${parseFloat(rawSats) / ONE_HUNDRED_THOUSAND}`;
    case "bits":
      return `${parseFloat(rawSats) / ONE_HUNDRED}`;
    case "satoshis":
      return rawSats;
    default:
      return rawSats;
  }
};

export const satoshiBalanceToCurrencyDisplay = (
  rawSats: string,
  currency: SupportedCurrency | BitcoinDenominationTypes
): string => {
  const rawValue = convertRawSatsToRawCurrency(rawSats, currency);
  const finalValue = prettifyRawCurrencyValue(rawValue, currency);
  console.log({ rawValue, rawSats, currency, finalValue });
  return finalValue;
};

export const bchPadBalanceToBchDisplay = (
  padBalance: string,
  bitcoinDenomination: BitcoinDenominationTypes
) => {
  const rawSats = convertPadBalanceToRawSats(padBalance, bitcoinDenomination);
  return satoshiBalanceToCurrencyDisplay(rawSats, bitcoinDenomination);
};

export const displayUsd = (value: string): string => {
  if (!value) {
    return "USD $0.00";
  }

  // 2 decimal places, rounding down
  const decimalised = (Math.floor(parseFloat(value) * 100) / 100).toFixed(2);
  return prettifyRawCurrencyValue(decimalised.toString(), "usd");
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
  return displayUsd(convertRawSatsToRawUsd(sats));
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

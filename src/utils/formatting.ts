import {
  convertRawBitsToRawSats,
  convertRawMbchToRawSats,
  convertRawBchToRawSats,
  convertRawUsdToSats,
  convertRawAudToSats,
  convertRawSatsToRawBits,
  convertRawSatsToRawMbch,
  convertRawSatsToRawBch,
  convertRawSatsToRawUsd,
  convertRawSatsToRawAud,
} from "./exchangeRates";
import { BitcoinDenominationTypes, SupportedCurrencyTypes } from "../types";
import { MAIN_NET_PREFIX, TEST_NET_PREFIX } from "./consts";

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

const allowedDecimalPlaces = (
  currency: BitcoinDenominationTypes | SupportedCurrencyTypes
): number => {
    switch (currency) {
    case "usd":
      return 2;
    case "aud":
      return 2;
    case "bitcoins":
      return 8;
    case "millibits":
      return 5;
    case "bits":
      return 2;
    case "satoshis":
      return 0;
    default:
      return 2;
};

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

const roundDownTo2DecimalPlaces = (input: string): string => {
  const inputAsFloat = parseFloat(input);
  const fixedDecimals = (Math.floor(inputAsFloat * 100) / 100).toFixed(2);
  return fixedDecimals.toString();
};

export const prettifyRawCurrency = (
  rawCurrency: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  const value = rawCurrency ?? "0";

  const is2dpCurrency = ["usd", "aud"].includes(currency);
  const roundedValue = is2dpCurrency ? roundDownTo2DecimalPlaces(value) : value;
  const chunkedValue = chunkPreDecimalInto3s(roundedValue);

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

export const convertRawSatsToRawCurrency = (
  rawSats: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  switch (currency) {
    case "usd":
      return convertRawSatsToRawUsd(rawSats);
    case "aud":
      return convertRawSatsToRawAud(rawSats);
    case "bitcoins":
      return convertRawSatsToRawBch(rawSats);
    case "millibits":
      return convertRawSatsToRawMbch(rawSats);
    case "bits":
      return convertRawSatsToRawBits(rawSats);
    case "satoshis":
      return rawSats;
    default:
      return rawSats;
  }
};

export const rawSatsToCurrencyDisplay = (
  rawSats: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  return prettifyRawCurrency(
    convertRawSatsToRawCurrency(rawSats, currency),
    currency
  );
};

export const convertRawCurrencyToRawSats = (
  rawCurrency: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  switch (currency) {
    case "usd":
      return convertRawUsdToSats(rawCurrency);
    case "aud":
      return convertRawAudToSats(rawCurrency);
    case "bitcoins":
      return convertRawBchToRawSats(rawCurrency);
    case "millibits":
      return convertRawMbchToRawSats(rawCurrency);
    case "bits":
      return convertRawBitsToRawSats(rawCurrency);
    case "satoshis":
      return rawCurrency;
    default:
      return rawCurrency;
  }
};

export const convertBalanceToDisplay = (
  padBalance: string,
  inputCurrency: SupportedCurrencyTypes | BitcoinDenominationTypes,
  outputCurrency: SupportedCurrencyTypes | BitcoinDenominationTypes
) => {
  const rawCurrency = `${parseFloat(padBalance)}`;
  const rawSats = convertRawCurrencyToRawSats(rawCurrency, inputCurrency);
  return rawSatsToCurrencyDisplay(rawSats, outputCurrency);
};

export const displayUsd = (value: string): string => {
  if (!value) {
    return "USD $0.00";
  }

  // 2 decimal places, rounding down
  const decimalised = (Math.floor(parseFloat(value) * 100) / 100).toFixed(2);
  return prettifyRawCurrency(decimalised.toString(), "usd");
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

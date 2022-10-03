import {
  convertRawBitsToRawSats,
  convertRawMbchToRawSats,
  convertRawBchToRawSats,
  convertRawAudToSats,
  convertRawBtcToSats,
  convertRawCadToSats,
  convertRawCnyToSats,
  convertRawEthToSats,
  convertRawEurToSats,
  convertRawGbpToSats,
  convertRawJpyToSats,
  convertRawPhpToSats,
  convertRawRubToSats,
  convertRawThbToSats,
  convertRawUsdToSats,
  convertRawSatsToRawBits,
  convertRawSatsToRawMbch,
  convertRawSatsToRawBch,
  convertRawSatsToRawAud,
  convertRawSatsToRawBtc,
  convertRawSatsToRawCad,
  convertRawSatsToRawCny,
  convertRawSatsToRawEth,
  convertRawSatsToRawEur,
  convertRawSatsToRawGbp,
  convertRawSatsToRawJpy,
  convertRawSatsToRawPhp,
  convertRawSatsToRawRub,
  convertRawSatsToRawThb,
  convertRawSatsToRawUsd,
} from "./exchangeRates";
import {
  BitcoinDenominationTypes,
  SupportedCurrencyTypes,
} from "@selene/common/dist/types";
import {
  MAIN_NET_PREFIX,
  TEST_NET_PREFIX,
  BITCOIN_DENOMINATIONS,
} from "@selene/common/dist/utils/consts";
import { CurrencyOrDenominationType } from "@selene/common/dist/types";

// Note on how this file works
// All values are passed between functions as strings

// Decimal places depend on the convention of the denomination/currency
// I.e. usd = 2dp, aud = 2dp
// btc = 2dp,
// BCH denominations
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

export const allowedDecimalPlaces = (
  currency: BitcoinDenominationTypes | SupportedCurrencyTypes
): number => {
  switch (currency) {
    case "aud":
      return 2;
    case "btc":
      return 8;
    case "cad":
      return 2;
    case "cny":
      return 2;
    case "eth":
      return 8;
    case "eur":
      return 2;
    case "gbp":
      return 2;
    case "jpy":
      return 0;
    case "php":
      return 2;
    case "rub":
      return 2;
    case "thb":
      return 2;
    case "usd":
      return 2;
    case BITCOIN_DENOMINATIONS.bitcoins:
      return 8;
    case BITCOIN_DENOMINATIONS.millibits:
      return 5;
    case BITCOIN_DENOMINATIONS.bits:
      return 2;
    case BITCOIN_DENOMINATIONS.satoshis:
      return 0;
    default:
      return 2;
  }
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

export const chunkPreDecimalInto3s = (
  value: string,
  isPreserveTrailingDigits: boolean = false
): string => {
  // Split pre-decimal number into chunks of 3, starting from right
  const isDot = value.includes(".");
  const splitString = value.split(".");
  const preDecimal = chunkRight(splitString?.[0]).join(" ");
  const postDecimal = splitString?.[1];

  if (!postDecimal && !isPreserveTrailingDigits) {
    return `${preDecimal}`;
  }

  // Allow "0" to be shown
  const postDecimalDisplay = postDecimal === undefined ? "" : postDecimal;
  const dotDisplay = isDot ? "." : "";

  return `${preDecimal}${dotDisplay}${postDecimalDisplay}`;
};

const roundDownToXDecimalPlaces = (input: string, x: number): string => {
  const inputAsFloat = parseFloat(input);
  const TenToPowerX = 10 ** x;
  const fixedDecimals = (
    Math.floor(inputAsFloat * TenToPowerX) / TenToPowerX
  ).toFixed(x);
  return fixedDecimals.toString();
};

export const roundAndChunkRawBalance = (
  rawValue: string,
  currency: CurrencyOrDenominationType,
  isPreserveTrailingDigits: boolean = false
): string => {
  const value = rawValue ?? "0";

  const roundedValue = roundDownToXDecimalPlaces(
    value,
    allowedDecimalPlaces(currency)
  );
  return chunkPreDecimalInto3s(roundedValue, isPreserveTrailingDigits);
};

export const prettifyRawCurrency = (
  rawCurrency: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  const chunkedValue = roundAndChunkRawBalance(rawCurrency, currency);

  switch (currency) {
    case "aud":
      return `AUD $${chunkedValue}`;
    case "btc":
      return `₿ ${chunkedValue} BTC`;
    case "cad":
      return `CAD $${chunkedValue}`;
    case "cny":
      return `CNY ¥${chunkedValue}`;
    case "eth":
      return `ETH ${chunkedValue}`;
    case "eur":
      return `EUR €${chunkedValue}`;
    case "gbp":
      return `GBP £${chunkedValue}`;
    case "jpy":
      return `JPY ¥${chunkedValue}`;
    case "php":
      return `PHP ₱${chunkedValue}`;
    case "rub":
      return `RUB ₽${chunkedValue}`;
    case "thb":
      return `THB ฿${chunkedValue}`;
    case "usd":
      return `USD $${chunkedValue}`;
    case BITCOIN_DENOMINATIONS.bitcoins:
      return `₿ ${chunkedValue} BCH`;
    case BITCOIN_DENOMINATIONS.millibits:
      return `₿ ${chunkedValue} mBCH`;
    case BITCOIN_DENOMINATIONS.bits:
      return `₿ ${chunkedValue} bits`;
    case BITCOIN_DENOMINATIONS.satoshis:
      return `₿ ${chunkedValue} sats`;
    default:
      return chunkedValue;
  }
};

export const prettifyPadBalance = (
  padBalance: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  const value = padBalance ?? "0";

  // Note, deliberately not rounded
  // To preserve ability to have "33." entered or "33.1"
  // instead of forcefit to "33.10"
  const chunkedValue = chunkPreDecimalInto3s(value, true);

  switch (currency) {
    case "aud":
      return `AUD $${chunkedValue}`;
    case "btc":
      return `₿ ${chunkedValue} BTC`;
    case "cad":
      return `CAD $${chunkedValue}`;
    case "cny":
      return `CNY ¥${chunkedValue}`;
    case "eth":
      return `ETH ${chunkedValue}`;
    case "eur":
      return `EUR €${chunkedValue}`;
    case "gbp":
      return `GBP £${chunkedValue}`;
    case "jpy":
      return `JPY ¥${chunkedValue}`;
    case "php":
      return `PHP ₱${chunkedValue}`;
    case "rub":
      return `RUB ₽${chunkedValue}`;
    case "thb":
      return `THB ฿${chunkedValue}`;
    case "usd":
      return `USD $${chunkedValue}`;
    case BITCOIN_DENOMINATIONS.bitcoins:
      return `₿ ${chunkedValue} BCH`;
    case BITCOIN_DENOMINATIONS.millibits:
      return `₿ ${chunkedValue} mBCH`;
    case BITCOIN_DENOMINATIONS.bits:
      return `₿ ${chunkedValue} bits`;
    case BITCOIN_DENOMINATIONS.satoshis:
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
    case "aud":
      return convertRawSatsToRawAud(rawSats);
    case "btc":
      return convertRawSatsToRawBtc(rawSats);
    case "cad":
      return convertRawSatsToRawCad(rawSats);
    case "cny":
      return convertRawSatsToRawCny(rawSats);
    case "eth":
      return convertRawSatsToRawEth(rawSats);
    case "eur":
      return convertRawSatsToRawEur(rawSats);
    case "gbp":
      return convertRawSatsToRawGbp(rawSats);
    case "jpy":
      return convertRawSatsToRawJpy(rawSats);
    case "php":
      return convertRawSatsToRawPhp(rawSats);
    case "rub":
      return convertRawSatsToRawRub(rawSats);
    case "thb":
      return convertRawSatsToRawThb(rawSats);
    case "usd":
      return convertRawSatsToRawUsd(rawSats);
    case BITCOIN_DENOMINATIONS.bitcoins:
      return convertRawSatsToRawBch(rawSats);
    case BITCOIN_DENOMINATIONS.millibits:
      return convertRawSatsToRawMbch(rawSats);
    case BITCOIN_DENOMINATIONS.bits:
      return convertRawSatsToRawBits(rawSats);
    case BITCOIN_DENOMINATIONS.satoshis:
      return rawSats;
    default:
      return rawSats;
  }
};

export const convertRawSatsToRawCurrencyRounded = (
  rawSats: string,
  currency: SupportedCurrencyTypes | BitcoinDenominationTypes
): string => {
  const value = convertRawSatsToRawCurrency(rawSats, currency);
  return roundDownToXDecimalPlaces(value, allowedDecimalPlaces(currency));
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
    case "aud":
      return convertRawAudToSats(rawCurrency);
    case "btc":
      return convertRawBtcToSats(rawCurrency);
    case "cad":
      return convertRawCadToSats(rawCurrency);
    case "cny":
      return convertRawCnyToSats(rawCurrency);
    case "eth":
      return convertRawEthToSats(rawCurrency);
    case "eur":
      return convertRawEurToSats(rawCurrency);
    case "gbp":
      return convertRawGbpToSats(rawCurrency);
    case "jpy":
      return convertRawJpyToSats(rawCurrency);
    case "php":
      return convertRawPhpToSats(rawCurrency);
    case "rub":
      return convertRawRubToSats(rawCurrency);
    case "thb":
      return convertRawThbToSats(rawCurrency);
    case "usd":
      return convertRawUsdToSats(rawCurrency);
    case BITCOIN_DENOMINATIONS.bitcoins:
      return convertRawBchToRawSats(rawCurrency);
    case BITCOIN_DENOMINATIONS.millibits:
      return convertRawMbchToRawSats(rawCurrency);
    case BITCOIN_DENOMINATIONS.bits:
      return convertRawBitsToRawSats(rawCurrency);
    case BITCOIN_DENOMINATIONS.satoshis:
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

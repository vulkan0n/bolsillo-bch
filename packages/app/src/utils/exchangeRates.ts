import store from "@selene/app/src/redux/store";
import {
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "@selene/common/dist/utils/consts";

// Sats out
export const convertRawBitsToRawSats = (bits: string): string =>
  `${parseFloat(bits) * ONE_HUNDRED}`;

export const convertRawMbchToRawSats = (mbch: string): string =>
  `${parseFloat(mbch) * ONE_HUNDRED_THOUSAND}`;

export const convertRawBchToRawSats = (bch: string): string =>
  `${parseFloat(bch) * ONE_HUNDRED_MILLION}`;

const convertRawValueToSats = (rawValue: string, exchangeRateKey: string) => {
  const price = store?.getState()?.exchangeRates?.[exchangeRateKey];
  const satPrice = ONE_HUNDRED_MILLION / parseFloat(price);
  const equivalentSats = Math.round(parseFloat(rawValue) * satPrice);
  return `${equivalentSats}`;
};

export const convertRawAudToSats = (aud: string): string =>
  convertRawValueToSats(aud, "audBchPrice");

export const convertRawBtcToSats = (btc: string): string =>
  convertRawValueToSats(btc, "btcBchPrice");

export const convertRawCadToSats = (cad: string): string =>
  convertRawValueToSats(cad, "cadBchPrice");

export const convertRawCnyToSats = (cny: string): string =>
  convertRawValueToSats(cny, "cnyBchPrice");

export const convertRawEthToSats = (eth: string): string =>
  convertRawValueToSats(eth, "ethBchPrice");

export const convertRawEurToSats = (eur: string): string =>
  convertRawValueToSats(eur, "eurBchPrice");

export const convertRawGbpToSats = (gbp: string): string =>
  convertRawValueToSats(gbp, "gbpBchPrice");

export const convertRawJpyToSats = (jpy: string): string =>
  convertRawValueToSats(jpy, "gbpBchPrice");

export const convertRawPhpToSats = (php: string): string =>
  convertRawValueToSats(php, "phpBchPrice");

export const convertRawRubToSats = (rub: string): string =>
  convertRawValueToSats(rub, "phpBchPrice");

export const convertRawThbToSats = (thb: string): string =>
  convertRawValueToSats(thb, "phpBchPrice");

export const convertRawUsdToSats = (usd: string): string =>
  convertRawValueToSats(usd, "usdBchPrice");

// Sats in
export const convertRawSatsToRawBits = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED}`;

export const convertRawSatsToRawMbch = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED_THOUSAND}`;

export const convertRawSatsToRawBch = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED_MILLION}`;

export const convertRawSatsToRawValue = (
  sats: string,
  exchangeRateKey: string
): string => {
  const price = store?.getState()?.exchangeRates?.[exchangeRateKey];
  const value = (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(price);
  return `${value}`;
};

export const convertRawSatsToRawAud = (sats: string): string =>
  convertRawSatsToRawValue(sats, "audBchPrice");

export const convertRawSatsToRawBtc = (sats: string): string =>
  convertRawSatsToRawValue(sats, "btcBchPrice");

export const convertRawSatsToRawCad = (sats: string): string =>
  convertRawSatsToRawValue(sats, "cadBchPrice");

export const convertRawSatsToRawCny = (sats: string): string =>
  convertRawSatsToRawValue(sats, "cnyBchPrice");

export const convertRawSatsToRawEth = (sats: string): string =>
  convertRawSatsToRawValue(sats, "ethBchPrice");

export const convertRawSatsToRawEur = (sats: string): string =>
  convertRawSatsToRawValue(sats, "eurBchPrice");

export const convertRawSatsToRawGbp = (sats: string): string =>
  convertRawSatsToRawValue(sats, "gbpBchPrice");

export const convertRawSatsToRawJpy = (sats: string): string =>
  convertRawSatsToRawValue(sats, "jpyBchPrice");

export const convertRawSatsToRawPhp = (sats: string): string =>
  convertRawSatsToRawValue(sats, "phpBchPrice");

export const convertRawSatsToRawRub = (sats: string): string =>
  convertRawSatsToRawValue(sats, "rubBchPrice");

export const convertRawSatsToRawThb = (sats: string): string =>
  convertRawSatsToRawValue(sats, "thbBchPrice");

export const convertRawSatsToRawUsd = (sats: string): string =>
  convertRawSatsToRawValue(sats, "usdBchPrice");

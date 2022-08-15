import store from "../redux/store";
import {
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "./consts";

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
  const equivalentSats = Math.floor(parseFloat(rawValue) * satPrice);
  return `${equivalentSats}`;
};

export const convertRawAudToSats = (aud: string): string =>
  convertRawValueToSats(aud, "audBchPrice");

export const convertRawBtcToSats = (btc: string): string =>
  convertRawValueToSats(btc, "btcBchPrice");

export const convertRawEurToSats = (eur: string): string =>
  convertRawValueToSats(eur, "eurBchPrice");

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

export const convertRawSatsToRawEur = (sats: string): string =>
  convertRawSatsToRawValue(sats, "eurBchPrice");

export const convertRawSatsToRawUsd = (sats: string): string =>
  convertRawSatsToRawValue(sats, "usdBchPrice");

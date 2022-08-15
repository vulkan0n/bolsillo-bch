import store from "../redux/store";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";
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

export const convertRawSatsToRawAud = (sats: string): string => {
  const audBchPrice = store?.getState()?.exchangeRates?.audBchPrice;
  const equivalentAud =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(audBchPrice);
  return `${equivalentAud}`;
};

export const convertRawSatsToRawBtc = (sats: string): string => {
  const btcBchPrice = store?.getState()?.exchangeRates?.btcBchPrice;
  const equivalentBtc =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(btcBchPrice);
  return `${equivalentBtc}`;
};

export const convertRawSatsToRawEur = (sats: string): string => {
  const eurBchPrice = store?.getState()?.exchangeRates?.eurBchPrice;
  const equivalentEur =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(eurBchPrice);
  return `${equivalentEur}`;
};

export const convertRawSatsToRawUsd = (sats: string): string => {
  const usdBchPrice = store?.getState()?.exchangeRates?.usdBchPrice;
  const equivalentUsd =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(usdBchPrice);
  return `${equivalentUsd}`;
};

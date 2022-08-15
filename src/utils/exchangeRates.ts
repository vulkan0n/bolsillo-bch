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

export const convertRawUsdToSats = (usd: string): string => {
  const usdBchPrice = store?.getState()?.exchangeRates?.usdBchPrice;
  const usdSatPrice = parseFloat(usdBchPrice) / ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(usd) * usdSatPrice;
  return `${equivalentSats}`;
};

export const convertRawAudToSats = (aud: string): string => {
  const audBchPrice = store?.getState()?.exchangeRates?.audBchPrice;
  const audSatPrice = parseFloat(audBchPrice) / ONE_HUNDRED_MILLION;

  const equivalentSats = parseFloat(aud) * audSatPrice;
  return `${equivalentSats}`;
};

export const convertRawEurToSats = (eur: string): string => {
  const eurBchPrice = store?.getState()?.exchangeRates?.eurBchPrice;
  const eurSatPrice = parseFloat(eurBchPrice) / ONE_HUNDRED_MILLION;

  const equivalentSats = parseFloat(eur) * eurSatPrice;
  return `${equivalentSats}`;
};

// Sats in
export const convertRawSatsToRawBits = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED}`;

export const convertRawSatsToRawMbch = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED_THOUSAND}`;

export const convertRawSatsToRawBch = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED_MILLION}`;

export const convertRawSatsToRawAud = (sats: string): string => {
  const { audBchPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentAud =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(audBchPrice);
  return `${equivalentAud}`;
};

export const convertRawSatsToRawEur = (sats: string): string => {
  const { eurBchPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentAud =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(eurBchPrice);
  return `${equivalentAud}`;
};

export const convertRawSatsToRawUsd = (sats: string): string => {
  const { usdBchPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentUsd =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(usdBchPrice);
  return `${equivalentUsd}`;
};

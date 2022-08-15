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
  const bchUsdPrice = store?.getState()?.exchangeRates?.bchUsdPrice;
  const satUsdPrice = parseFloat(bchUsdPrice) * ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(usd) * satUsdPrice;
  return `${equivalentSats}`;
};

export const convertRawAudToSats = (aud: string): string => {
  const bchAudPrice = store?.getState()?.exchangeRates?.bchAudPrice;
  const satUsdPrice = parseFloat(bchAudPrice) * ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(aud) * satUsdPrice;
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
  const { bchAudPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentAud =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(bchAudPrice);
  return `${equivalentAud}`;
};

export const convertRawSatsToRawUsd = (sats: string): string => {
  const { bchUsdPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentUsd =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(bchUsdPrice);
  return `${equivalentUsd}`;
};

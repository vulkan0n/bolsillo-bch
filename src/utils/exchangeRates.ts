import { useSelector } from "react-redux";
import { ReduxState } from "../types";
import {
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "./consts";

// Sats out
export const convertRawBitsToRawSats = (rawBits: string): string =>
  `${parseFloat(rawBits) * ONE_HUNDRED}`;

export const convertRawMbchToRawSats = (rawMbch: string): string =>
  `${parseFloat(rawMbch) * ONE_HUNDRED_THOUSAND}`;

export const convertRawBchToRawSats = (rawBch: string): string =>
  `${parseFloat(rawBch) * ONE_HUNDRED_MILLION}`;

export const convertRawUsdToSats = (rawUsd: string): string => {
  const { bchUsdPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const satUsdPrice = parseFloat(bchUsdPrice) * ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(rawUsd) * satUsdPrice;
  return `${equivalentSats}`;
};

export const convertRawAudToSats = (rawAud: string): string => {
  const { bchAudPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const satUsdPrice = parseFloat(bchAudPrice) * ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(rawAud) * satUsdPrice;
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

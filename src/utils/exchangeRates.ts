import store from "../redux/store";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";
import { ONE_HUNDRED_MILLION } from "./consts";

export const convertRawUsdToSats = (rawUsd: string): string => {
  const { bchUsdPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const satUsdPrice = parseFloat(bchUsdPrice) * ONE_HUNDRED_MILLION;
  const equivalentSats = parseFloat(rawUsd) * satUsdPrice;
  console.log({ rawUsd, equivalentSats });
  return `${equivalentSats}`;
};

export const convertRawSatsToRawMbch = (sats: string): string =>
  `${parseFloat(sats) / ONE_HUNDRED_MILLION}`;

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

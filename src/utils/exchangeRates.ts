import store from "../redux/store";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";

const SATS_PER_BCH = 100000000;

export const convertSatsToUsd = (sats: string): string => {
  const { bchUsdPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentUsd =
    (parseFloat(sats) / SATS_PER_BCH) * parseFloat(bchUsdPrice);
  return `${equivalentUsd}`;
};

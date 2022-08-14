import store from "../redux/store";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";
import {
  ONE_HUNDRED,
  ONE_HUNDRED_THOUSAND,
  ONE_HUNDRED_MILLION,
} from "./consts";

export const convertPadBalanceInDenominationToSats = (
  padBalance: string,
  denomination: string
) => {
  switch (denomination) {
    case "bitcoins":
      return `${parseFloat(padBalance) * ONE_HUNDRED_MILLION}`;
    case "millibitcoins":
      return `${parseFloat(padBalance) * ONE_HUNDRED_THOUSAND}`;
    case "bits":
      return `${parseFloat(padBalance) * ONE_HUNDRED}`;
    case "satoshis":
      return padBalance;
    default:
      return padBalance;
  }
};

export const convertSatsToUsd = (sats: string): string => {
  const { bchUsdPrice } = useSelector(
    (state: ReduxState) => state.exchangeRates
  );
  const equivalentUsd =
    (parseFloat(sats) / ONE_HUNDRED_MILLION) * parseFloat(bchUsdPrice);
  return `${equivalentUsd}`;
};

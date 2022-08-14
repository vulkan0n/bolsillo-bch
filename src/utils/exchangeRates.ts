import store from "../redux/store";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";

const ONE_HUNDRED_MILLION = 100000000; // Sats per BCH
const ONE_HUNDRED_THOUSAND = 100000; // Sats per mBCH
const ONE_HUNDRED = 100; // Sats per bit

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

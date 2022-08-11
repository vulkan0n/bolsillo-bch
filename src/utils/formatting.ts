import { convertSatsToUsd } from "./exchangeRates";
import { useSelector } from "react-redux";
import { ReduxState } from "../types";

export const displayUsd = (sats: string): string => {
  if (!sats) {
    return "USD $0.00";
  }

  // 2 decimal places, rounding down
  const res = Math.floor(parseFloat(sats) * 100) / 100;

  return `USD $${res.toFixed(2)}`;
};

export const displaySats = (sats: string): string => {
  if (!sats) {
    return "0 sats";
  }

  return `${parseFloat(sats)} sats`;
};

export const displaySatsAsUsd = (sats: string): string => {
  return displayUsd(convertSatsToUsd(sats));
};

export const formatStringToCashAddress = (string: string): string => {
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const testNetPrefix = "bchtest:";
  const mainNetPrefix = "bitcoincash:";
  const isPrefix =
    (isTestNet && string.includes(testNetPrefix)) ||
    (!isTestNet && string.includes(mainNetPrefix));
  const prefix = isTestNet ? testNetPrefix : mainNetPrefix;
  const address = string.trim().toLowerCase();
  return `${isPrefix ? prefix : ""}${address}`;
};

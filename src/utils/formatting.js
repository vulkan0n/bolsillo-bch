import { convertSatsToUsd } from "./exchangeRates";

export const displayUsd = (stringVal) => {
  if (!stringVal) {
    return "USD $0.00";
  }

  // 2 decimal places, rounding down
  const res = Math.floor(parseFloat(stringVal) * 100) / 100;

  return `USD $${res.toFixed(2)}`;
};

export const displaySats = (stringVal) => {
  if (!stringVal) {
    return "0 sats";
  }

  return `${parseFloat(stringVal)} sats`;
};

export const displaySatsAsUsd = (stringVal) => {
  return displayUsd(convertSatsToUsd(stringVal));
};

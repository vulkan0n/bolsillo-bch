import { convertSatsToUsd } from "./exchangeRates";

export const displayUsd = (stringVal) => {
  if (!stringVal) {
    return "USD $0.00";
  }

  return `USD $${Number(stringVal).toFixed(2)}`;
};

export const displaySats = (stringVal) => {
  if (!stringVal) {
    return "0 sats";
  }

  return `${Number(stringVal)} sats`;
};

export const displaySatssAsUsd = (stringVal) => {
  return displayUsd(convertSatsToUsd(stringVal));
};

import { convertSatsToUsd } from "./exchangeRates";

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

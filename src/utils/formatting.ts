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

// Split string into groups of 3 characters, starting from right side
// https://stackoverflow.com/a/63716019
function chunkRight(str, size = 3) {
  if (typeof str === "string") {
    const length = str.length;
    const chunks = Array(Math.ceil(length / size));
    if (length) {
      chunks[0] = str.slice(0, length % size || size);
      for (let i = 1, index = chunks[0].length; index < length; i++) {
        chunks[i] = str.slice(index, (index += size));
      }
    }
    return chunks;
  }
}

export const displaySats = (sats: string): string => {
  if (!sats) {
    return "0 sats";
  }

  const floatSats = parseFloat(sats);
  // i.e. '1 000 120' not `1000120`
  const spacedChunks = chunkRight(floatSats.toString()).join(" ");

  return `${spacedChunks} sats`;
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

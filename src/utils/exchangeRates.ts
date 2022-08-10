import store from "../redux/store";

const SATS_PER_BCH = 100000000;

export const convertSatsToUsd = (sats: string): string => {
  const { bchUsdPrice } = store.getState();
  const equivalentUsd =
    (parseFloat(sats) / SATS_PER_BCH) * parseFloat(bchUsdPrice);
  return `${equivalentUsd}`;
};

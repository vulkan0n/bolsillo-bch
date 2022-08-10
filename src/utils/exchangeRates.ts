import store from "../redux/store";

const SATS_PER_BCH = 100000000;

export const convertSatsToUsd = (sats: string): number => {
  const { bchUsdPrice } = store.getState();
  return (parseFloat(sats) / SATS_PER_BCH) * parseFloat(bchUsdPrice);
};

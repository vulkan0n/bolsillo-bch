import { TEST_NET_PREFIX, MAIN_NET_PREFIX } from "./consts";

export const isValidBchAddress = (
  address: string,
  isTestNet: boolean = false
): boolean => {
  const isValidTestNetAddress = isTestNet && address?.includes(TEST_NET_PREFIX);
  const isValidMainNetAddress =
    !isTestNet && address?.includes(MAIN_NET_PREFIX);
  return isValidTestNetAddress || isValidMainNetAddress;
};

export const countDecimalPlaces = (input: string): number =>
  input?.split(".")?.[1]?.length || 0;

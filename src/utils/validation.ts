import { TEST_NET_PREFIX, MAIN_NET_PREFIX } from "./consts";

export const validateWalletName = (
  name: string,
  existingWalletNames: string[]
): string => {
  if (name?.length === 0) {
    return "Can't be empty.";
  }

  if (name?.length > 30) {
    return "Can't be more than 30 characters.";
  }

  if (existingWalletNames?.includes(name)) {
    return "Name already in use.";
  }

  return null;
};

export const validateWalletDescription = (description: string): string => {
  if (description?.length > 100) {
    return "Can't be more than 100 characters.";
  }

  return null;
};

export const validateWalletMnemonic = (menemonic: string): string => {
  if (menemonic?.split(" ").length !== 12) {
    return "Must be exactly 12 words long.";
  }

  return null;
};

const isValidTestNetCashAddress = (address: string): boolean => {
  if (address.length !== 50) {
    return false;
  }

  const startString = address.substring(0, 9);
  const isMatchPrefix = startString === `${TEST_NET_PREFIX}q`;

  if (!isMatchPrefix) {
    return false;
  }

  return true;
};

const isValidMainNetCashAddress = (address: string): boolean => {
  if (address.length !== 54) {
    return false;
  }

  const startString = address.substring(0, 13);
  const isMatchPrefix = startString === `${MAIN_NET_PREFIX}q`;

  if (!isMatchPrefix) {
    return false;
  }

  return true;
};

export const isValidCashAddress = (
  address: string,
  isTestNet: boolean = false
): boolean =>
  isTestNet
    ? isValidTestNetCashAddress(address)
    : isValidMainNetCashAddress(address);

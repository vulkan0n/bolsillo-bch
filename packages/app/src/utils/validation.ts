import {
  TEST_NET_PREFIX,
  MAIN_NET_PREFIX,
  ONE_HUNDRED_MILLION,
  TOTAL_SATOSHI_SUPPLY,
} from "./consts";
import { formatStringToCashAddress } from "./formatting";

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

type ValidateRequestType = {
  isValid: boolean;
  address: string;
  rawSatAmount: string;
};

// Example request
// "bitcoincash:qpgtjfxyp2hlwn28754xm46f55p57tzlgq8tkjju7r?amount=0.00099423"
export const validateRequestString = (
  request: string,
  isTestNet: boolean = false
): ValidateRequestType => {
  const addressPrefix = formatStringToCashAddress(
    request.split("?")?.[0] ?? ""
  );
  const amountSuffix = request.split("?")?.[1];
  const isValidAddress = isValidCashAddress(addressPrefix, isTestNet);

  if (!isValidAddress) {
    return {
      isValid: false,
      address: "",
      rawSatAmount: "",
    };
  }

  if (!amountSuffix) {
    return {
      isValid: true,
      address: addressPrefix,
      rawSatAmount: "",
    };
  }

  const AMOUNT_INSTRUCTION = "amount";
  const amountText = amountSuffix.split("=")?.[0] ?? "";
  const bchAmount = parseFloat(amountSuffix.split("=")?.[1]);
  const isAmountInstruction = amountText === AMOUNT_INSTRUCTION;
  // JS can have small imperfections in the float this returns
  const satAmount = Math.floor(bchAmount * ONE_HUNDRED_MILLION);
  const isValidSuffix =
    isAmountInstruction && satAmount > 0 && satAmount <= TOTAL_SATOSHI_SUPPLY;

  if (!isValidSuffix) {
    return {
      isValid: false,
      address: addressPrefix,
      rawSatAmount: "",
    };
  }

  return {
    isValid: true,
    address: addressPrefix,
    rawSatAmount: `${satAmount}`,
  };
};

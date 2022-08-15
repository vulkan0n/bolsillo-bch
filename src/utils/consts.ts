import { SupportedCurrency } from "../types";

// Address formats
export const TEST_NET_PREFIX: string = "bchtest:";
export const MAIN_NET_PREFIX: string = "bitcoincash:";
export const DEFAULT_DERIVATION_PATH: string = "m/44'/0'/0'/0/0";

// Time
export const THIRTY_SECONDS: number = 30000; // in milliseconds

// Denominations
export const ONE_HUNDRED_MILLION: number = 100000000; // Sats per BCH
export const ONE_HUNDRED_THOUSAND: number = 100000; // Sats per mBCH
export const ONE_HUNDRED: number = 100; // Sats per bit

// Organize alphabetically please!
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  {
    code: "aud",
    fullName: "Australian Dollar",
  },
  {
    code: "eur",
    fullName: "The Euro",
  },
  {
    code: "usd",
    fullName: "United States Dollar",
  },
];

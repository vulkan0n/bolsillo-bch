import { SupportedCurrency, BitcoinDenominationTypes } from "@types";

// Address formats
export const TEST_NET_PREFIX: string = "bchtest:";
export const MAIN_NET_PREFIX: string = "bitcoincash:";
export const DEFAULT_DERIVATION_PATH: string = "m/44'/0'/0'/0/0";

// Time
export const ONE_SECOND: number = 1000; // in milliseconds
export const TEN_SECONDS: number = ONE_SECOND * 10; // in milliseconds
export const THIRTY_SECONDS: number = ONE_SECOND * 30; // in milliseconds

// Denominations
export const ONE_HUNDRED_MILLION: number = 100000000; // Sats per BCH
export const ONE_HUNDRED_THOUSAND: number = 100000; // Sats per mBCH
export const ONE_HUNDRED: number = 100; // Sats per bit
// Total Bitcoin Satoshi supply
// A little less than 21 quadrillion
export const TOTAL_SATOSHI_SUPPLY: number = 2099999997690000;
export const BITCOIN_DENOMINATIONS = {
  bitcoins: "bitcoins",
  millibits: "millibits",
  bits: "bits",
  satoshis: "satoshis",
};

// Other
export const TEN_MILLION: number = 10000000; // Daily active users target

// Organize alphabetically please!
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  {
    code: "aud",
    fullName: "Australian Dollar",
  },
  {
    code: "btc",
    fullName: "Bitcoin (Core)",
  },
  {
    code: "cad",
    fullName: "Canadian Dollar",
  },
  {
    code: "eth",
    fullName: "Ethereum",
  },
  {
    code: "eur",
    fullName: "The Euro",
  },
  {
    code: "gbp",
    fullName: "Great British Pound",
  },
  // There is some kind of bug with commented out currencies
  // Their live balance doesn't work as well as it should
  // Exchange rate seems off, using complete balance comes out way
  // out of whack. Perhaps a rounding or precision error for these
  // very weak currencies?
  // {
  //   code: "jpy",
  //   fullName: "Japanese Yen",
  // },
  {
    code: "php",
    fullName: "Phillipine Peso",
  },
  // {
  //   code: "rub",
  //   fullName: "Russian Ruble",
  // },
  // {
  //   code: "thb",
  //   fullName: "Thai Baht",
  // },
  {
    code: "usd",
    fullName: "United States Dollar",
  },
];

// BCH stuff
export const DEVELOPER_DONATION_ADDRESS =
  "bitcoincash:qrer20k4s5emsm5a2xnsy2r2f7xz3veqwuktrmwfxq";

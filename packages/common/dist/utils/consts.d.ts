import { SupportedCurrency, BitcoinDenominationTypes, CheckInPeriodTypes } from "@selene-wallet/common/types";
export declare const TEST_NET_PREFIX: string;
export declare const MAIN_NET_PREFIX: string;
export declare const DEFAULT_DERIVATION_PATH: string;
export declare const ONE_SECOND: number;
export declare const TEN_SECONDS: number;
export declare const THIRTY_SECONDS: number;
export declare const ONE_HUNDRED_MILLION: number;
export declare const ONE_HUNDRED_THOUSAND: number;
export declare const ONE_HUNDRED: number;
export declare const TOTAL_SATOSHI_SUPPLY: number;
export declare const BITCOIN_DENOMINATIONS: {
    bitcoins: BitcoinDenominationTypes;
    millibits: BitcoinDenominationTypes;
    bits: BitcoinDenominationTypes;
    satoshis: BitcoinDenominationTypes;
};
export declare const TEN_MILLION: number;
export declare const SUPPORTED_CURRENCIES: SupportedCurrency[];
export declare const DEVELOPER_DONATION_ADDRESS = "bitcoincash:qrer20k4s5emsm5a2xnsy2r2f7xz3veqwuktrmwfxq";
export declare const CHECK_IN_PERIOD_TYPES: {
    daily: CheckInPeriodTypes;
    weekly: CheckInPeriodTypes;
    monthly: CheckInPeriodTypes;
    yearly: CheckInPeriodTypes;
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHECK_IN_TYPES = exports.DEVELOPER_DONATION_ADDRESS = exports.SUPPORTED_CURRENCIES = exports.TEN_MILLION = exports.BITCOIN_DENOMINATIONS = exports.TOTAL_SATOSHI_SUPPLY = exports.ONE_HUNDRED = exports.ONE_HUNDRED_THOUSAND = exports.ONE_HUNDRED_MILLION = exports.THIRTY_SECONDS = exports.TEN_SECONDS = exports.ONE_SECOND = exports.DEFAULT_DERIVATION_PATH = exports.MAIN_NET_PREFIX = exports.TEST_NET_PREFIX = exports.IS_WEB = void 0;
const react_native_1 = require("react-native");
exports.IS_WEB = react_native_1.Platform.OS === "web";
exports.TEST_NET_PREFIX = "bchtest:";
exports.MAIN_NET_PREFIX = "bitcoincash:";
exports.DEFAULT_DERIVATION_PATH = "m/44'/0'/0'/0/0";
exports.ONE_SECOND = 1000;
exports.TEN_SECONDS = exports.ONE_SECOND * 10;
exports.THIRTY_SECONDS = exports.ONE_SECOND * 30;
exports.ONE_HUNDRED_MILLION = 100000000;
exports.ONE_HUNDRED_THOUSAND = 100000;
exports.ONE_HUNDRED = 100;
exports.TOTAL_SATOSHI_SUPPLY = 2099999997690000;
exports.BITCOIN_DENOMINATIONS = {
    bitcoins: "bitcoins",
    millibits: "millibits",
    bits: "bits",
    satoshis: "satoshis",
};
exports.TEN_MILLION = 10000000;
exports.SUPPORTED_CURRENCIES = [
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
    {
        code: "php",
        fullName: "Phillipine Peso",
    },
    {
        code: "usd",
        fullName: "United States Dollar",
    },
];
exports.DEVELOPER_DONATION_ADDRESS = "bitcoincash:qrer20k4s5emsm5a2xnsy2r2f7xz3veqwuktrmwfxq";
exports.CHECK_IN_TYPES = {
    daily: "DAILY",
    weekly: "WEEKLY",
    monthly: "MONTHLY",
    yearly: "YEARLY",
};
//# sourceMappingURL=consts.js.map
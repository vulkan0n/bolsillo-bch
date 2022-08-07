const initialState = {
  wallet: {},
  balance: {
    bch: "0",
    usd: "0",
    sat: "0",
  },
  tempTxId: "",
  // Settings
  isCryptoDenominated: true,
  // Exchange Rates
  bchUsdPrice: "141.16",
};

export default initialState;

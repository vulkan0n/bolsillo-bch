const initialState = {
  // Retrieved from Bridge and stored here
  wallet: {},
  balance: {
    bch: "0",
    usd: "0",
    sat: "0",
  },
  tempTxId: "",
  // Exchange Rates
  bchUsdPrice: "141.16",
};

export default initialState;

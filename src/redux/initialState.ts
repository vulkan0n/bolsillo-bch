const initialState = {
  // Retrieved from Bridge and stored here
  wallet: {},
  balance: {
    bch: "0",
    usd: "0",
    sat: "0",
  },
  tempTxId: "",
  // Locally relevant stuff
  transactionPadBalance: "0",
  transactionPadState: "",
  transactionPadError: "",
  // Exchange Rates
  bchUsdPrice: "141.16",
};

export default initialState;

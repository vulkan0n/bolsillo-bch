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
  transactionPadState: "", // Enum: '', 'Receive'
  // Settings
  isCryptoDenominated: true,
  // Exchange Rates
  bchUsdPrice: "141.16",
};

export default initialState;

// Message types sent from App.js / React Native -> Bridge.js / React
export const BRIDGE_MESSAGE_TYPES = {
  CREATE_WALLET: "CREATE_WALLET",
  REQUEST_BALANCE: "REQUEST_BALANCE",
};

// Message types sent from Bridge.js / React -> App.js / React Native
export const RESPONSE_MESSAGE_TYPES = {
  CREATE_WALLET_RESPONSE: "CREATE_WALLET_RESPONSE",
  REQUEST_BALANCE_RESPONSE: "REQUEST_BALANCE_RESPONSE",
};

export default {
  BRIDGE_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
};

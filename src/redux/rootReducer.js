import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";

const {
  UDPATE_WALLET,
  UPDATE_BALANCE,
  UPDATE_TEMP_TXID,
  UPDATE_TRANSACTION_PAD_BALANCE,
  UPDATE_TRANSACTION_PAD_STATE,
  UPDATE_TRANSACTION_PAD_ERROR,
  TOGGLE_IS_CRYPTO_DENOMINATED,
} = ACTION_TYPES;

export default function rootReducer(state = initialState, action) {
  // console.log({ state, action });
  switch (action.type) {
    case UDPATE_WALLET:
      return {
        ...state,
        wallet: action.payload.wallet,
      };
    case UPDATE_BALANCE:
      return {
        ...state,
        balance: action.payload.balance,
      };
    case UPDATE_TEMP_TXID:
      return {
        ...state,
        tempTxId: action.payload.tempTxId,
      };
    case UPDATE_TRANSACTION_PAD_BALANCE:
      return {
        ...state,
        transactionPadBalance: action.payload.transactionPadBalance,
      };
    case UPDATE_TRANSACTION_PAD_STATE:
      return {
        ...state,
        transactionPadState: action.payload.transactionPadState,
      };
    case UPDATE_TRANSACTION_PAD_ERROR:
      return {
        ...state,
        transactionPadError: action.payload.transactionPadError,
      };
    case TOGGLE_IS_CRYPTO_DENOMINATED:
      return {
        ...state,
        isCryptoDenominated: !state?.isCryptoDenominated,
      };
    default:
      return state;
  }
}

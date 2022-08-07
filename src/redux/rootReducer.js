import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";

const {
  UDPATE_WALLET,
  UPDATE_BALANCE,
  UPDATE_TEMP_TXID,
  TOGGLE_IS_CRYPTO_DENOMINATED,
  UPDATE_TRANSACTION_PAD_STATE,
} = ACTION_TYPES;

export default function rootReducer(state = initialState, action) {
  console.log({ state, action });
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
    case UPDATE_TRANSACTION_PAD_STATE:
      return {
        ...state,
        transactionPadState: action.payload.transactionPadState,
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

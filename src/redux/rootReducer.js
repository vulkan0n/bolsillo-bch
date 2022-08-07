import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";

const {
  STORE_WALLET,
  UPDATE_BALANCE,
  UPDATE_TEMP_TXID,
  TOGGLE_IS_CRYPTO_DENOMINATED,
} = ACTION_TYPES;

export default function rootReducer(state = initialState, action) {
  console.log({ state, action });
  switch (action.type) {
    case STORE_WALLET:
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
    case TOGGLE_IS_CRYPTO_DENOMINATED:
      return {
        ...state,
        isCryptoDenominated: !state?.isCryptoDenominated,
      };
    default:
      return state;
  }
}

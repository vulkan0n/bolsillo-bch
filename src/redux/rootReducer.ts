import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";
import settingsReducer from "./settingsReducer";
import { combineReducers } from "redux";

const {
  UDPATE_WALLET,
  UPDATE_BALANCE,
  UPDATE_TEMP_TXID,
  UPDATE_TRANSACTION_PAD_BALANCE,
  UPDATE_TRANSACTION_PAD_STATE,
  UPDATE_TRANSACTION_PAD_ERROR,
} = ACTION_TYPES;

interface WalletType {
  mnemonic: string;
}

interface UpdateWalletAction {
  type: "UPDATE_WALLET";
  payload: {
    wallet?: WalletType;
    balance?: string;
    tempTxId?: string;
    transactionPadBalance?: string;
    transactionPadState?: "" | "Receive";
    transactionPadError?: string;
  };
}

function rootReducer(state = initialState, action: UpdateWalletAction) {
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
    default:
      return state;
  }
}

const mergedReducer = combineReducers({
  root: rootReducer,
  settings: settingsReducer,
});

export default mergedReducer;

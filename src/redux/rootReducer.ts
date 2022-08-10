import { combineReducers } from "redux";
import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";
import settingsReducer from "./reducers/settingsReducer";
import transactionPadReducer from "./reducers/transactionPadReducer";
import { WalletType } from "../types";

const { UDPATE_WALLET, UPDATE_BALANCE, UPDATE_TEMP_TXID } = ACTION_TYPES;

interface UpdateWalletAction {
  type: "UPDATE_WALLET";
  payload: {
    wallet?: WalletType;
    balance?: string;
    tempTxId?: string;
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

    default:
      return state;
  }
}

const mergedReducer = combineReducers({
  root: rootReducer,
  transactionPad: transactionPadReducer,
  settings: settingsReducer,
});

export default mergedReducer;

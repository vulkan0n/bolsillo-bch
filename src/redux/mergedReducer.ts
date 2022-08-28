import { combineReducers } from "redux";
import transactionPadReducer from "./reducers/transactionPadReducer";
import exchangeRatesReducer from "./reducers/exchangeRatesReducer";
import walletManagerReducer from "./reducers/walletManagerReducer";
import settingsReducer from "./reducers/settingsReducer";
import localReducer from "./reducers/localReducer";

const mergedReducer = combineReducers({
  transactionPad: transactionPadReducer,
  exchangeRates: exchangeRatesReducer,
  walletManager: walletManagerReducer,
  settings: settingsReducer,
  local: localReducer,
});

export default mergedReducer;

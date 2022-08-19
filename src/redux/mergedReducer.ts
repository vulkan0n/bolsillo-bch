import { combineReducers } from "redux";
import transactionPadReducer from "./reducers/transactionPadReducer";
import exchangeRatesReducer from "./reducers/exchangeRatesReducer";
import walletManagerReducer from "./reducers/walletManagerReducer";
import settingsReducer from "./reducers/settingsReducer";

const mergedReducer = combineReducers({
  transactionPad: transactionPadReducer,
  exchangeRates: exchangeRatesReducer,
  walletManager: walletManagerReducer,
  settings: settingsReducer,
});

export default mergedReducer;

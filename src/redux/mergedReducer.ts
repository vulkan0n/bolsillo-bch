import { combineReducers } from "redux";
import bridgeReducer from "./reducers/bridgeReducer";
import transactionPadReducer from "./reducers/transactionPadReducer";
import exchangeRatesReducer from "./reducers/exchangeRatesReducer";
import walletManagerReducer from "./reducers/walletManagerReducer";
import settingsReducer from "./reducers/settingsReducer";

const mergedReducer = combineReducers({
  bridge: bridgeReducer,
  transactionPad: transactionPadReducer,
  exchangeRates: exchangeRatesReducer,
  walletsManager: walletManagerReducer,
  settings: settingsReducer,
});

export default mergedReducer;

import { combineReducers } from "redux";
import bridgeReducer from "./reducers/bridgeReducer";
import transactionPadReducer from "./reducers/transactionPadReducer";
import exchangeRatesReducer from "./reducers/exchangeRatesReducer";
import settingsReducer from "./reducers/settingsReducer";

const mergedReducer = combineReducers({
  bridge: bridgeReducer,
  transactionPad: transactionPadReducer,
  exchangeRates: exchangeRatesReducer,
  settings: settingsReducer,
});

export default mergedReducer;

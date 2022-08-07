import { applyMiddleware, createStore, compose } from "redux";
import { persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "redux-logger";

import rootReducer from "./rootReducer";
import initialState from "./initialState";

// https://redux.js.org/api/createstore
const store = createStore(
  persistReducer(
    {
      key: "root",
      storage: AsyncStorage,
      stateReconciler: autoMergeLevel2,
    },
    rootReducer
  ),
  initialState,
  compose(applyMiddleware()) // logger
);

export default store; // Alow other methods to import store for '.getState()' purposes

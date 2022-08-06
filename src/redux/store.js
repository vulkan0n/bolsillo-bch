import { applyMiddleware, createStore, compose } from "redux";
import { persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web and AsyncStorage for react-native

import rootReducer from "./rootReducer";
import initialState from "./initialState";

// https://redux.js.org/api/createstore
const store = createStore(
  persistReducer(
    {
      key: "root",
      storage,
      stateReconciler: autoMergeLevel2,
    },
    rootReducer
  ),
  initialState,
  compose(applyMiddleware())
);

export default store; // Alow other methods to import store for '.getState()' purposes

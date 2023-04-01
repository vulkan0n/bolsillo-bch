import { configureStore } from "@reduxjs/toolkit";
import { walletReducer } from "./wallet";
import { electrumReducer } from "./electrum";

export const store = configureStore({
  reducer: {
    electrum: electrumReducer,
    wallet: walletReducer,
  },
});

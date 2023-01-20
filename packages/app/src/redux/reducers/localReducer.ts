import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { LocalState } from "@selene-wallet/common/dist/types/reducers/localReducer";

const initialState = {
  lastSentTransactionHash: "",
  lastDailyCheckIn: "",
  lastWeeklyCheckIn: "",
  lastMonthlyCheckIn: "",
  lastYearlyCheckIn: "",
  subscribedCashAddresses: [],
} as LocalState;

const localSlice = createSlice({
  name: "local",
  initialState,
  reducers: {
    updateLocalLastSentTransactionHash(state, action) {
      state.lastSentTransactionHash = action.payload.lastSentTransactionHash;
    },
    updateLocalLastDailyCheckIn(state, action) {
      console.log("hit this last daily check in");
      console.log(action.payload);
      state.lastDailyCheckIn = action.payload.lastDailyCheckIn;
    },
    updateLocalLastWeeklyCheckIn(state, action) {
      state.lastWeeklyCheckIn = action.payload.lastWeeklyCheckIn;
    },
    updateLocalLastMonthlyCheckIn(state, action) {
      state.lastMonthlyCheckIn = action.payload.lastMonthlyCheckIn;
    },
    updateLocalLastYearlyCheckIn(state, action) {
      state.lastYearlyCheckIn = action.payload.lastYearlyCheckIn;
    },
    addSubscribedCashAddress(state, action) {
      // TaggedCashAddressType
      console.log(
        "adding new subscribed taggedCashAddress",
        action.payload.taggedCashAddress
      );
      state.subscribedCashAddresses = [
        ...state.subscribedCashAddresses,
        action.payload.taggedCashAddress,
      ];
    },
    clearSubscribedCashAddresses(state) {
      state.subscribedCashAddresses = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState);
  },
});

export const {
  updateLocalLastSentTransactionHash,
  updateLocalLastDailyCheckIn,
  updateLocalLastWeeklyCheckIn,
  updateLocalLastMonthlyCheckIn,
  updateLocalLastYearlyCheckIn,
  addSubscribedCashAddress,
  clearSubscribedCashAddresses,
} = localSlice.actions;
export default localSlice.reducer;

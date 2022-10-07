import moment from "moment";
import {
  updateLocalLastDailyCheckIn,
  updateLocalLastWeeklyCheckIn,
  updateLocalLastMonthlyCheckIn,
  updateLocalLastYearlyCheckIn,
} from "@selene-wallet/app/src/redux/reducers/localReducer";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import inferCheckInWindow from "@selene-wallet/common/dist/utils/checkIn";
import store from "@selene-wallet/app/src/redux/store";
import { gql } from "@apollo/client";
import apolloClient from "@selene-wallet/app/src/apolloClient";

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($period: String!, $date: String!) {
    sendCheckIn(period: $period, date: $date) {
      status
    }
  }
`;

const doCheckIn = ({ period, updateMethod, updateProperty }) => {
  const now = moment.utc();
  const nowFormatted = now.format("YYYYMMDD");

  const checkInWindow = inferCheckInWindow(period);

  const lastCheckIn = store.getState().local[updateProperty] || "";

  const lastCheckInMoment = moment
    .utc(lastCheckIn, "YYYYMMDD")
    .startOf(checkInWindow)
    .add(1, "s");
  const nextCheckIn = lastCheckInMoment
    .clone()
    .add(1, checkInWindow)
    .startOf("day");

  const isShouldCheckIn = lastCheckIn === "" || now.isAfter(nextCheckIn);

  if (isShouldCheckIn) {
    apolloClient.mutate({
      mutation: SEND_DAILY_CHECK_IN,
      variables: {
        period,
        date: nowFormatted,
      },
    });

    store.dispatch(
      updateMethod({
        [updateProperty]: nowFormatted,
      })
    );
  }
};

const dailyCheckIn = () =>
  doCheckIn({
    period: CHECK_IN_PERIOD_TYPES.daily,
    updateMethod: updateLocalLastDailyCheckIn,
    updateProperty: "lastDailyCheckIn",
  });

const weeklyCheckIn = () =>
  doCheckIn({
    period: CHECK_IN_PERIOD_TYPES.weekly,
    updateMethod: updateLocalLastWeeklyCheckIn,
    updateProperty: "lastWeeklyCheckIn",
  });

const monthlyCheckIn = () =>
  doCheckIn({
    period: CHECK_IN_PERIOD_TYPES.monthly,
    updateMethod: updateLocalLastMonthlyCheckIn,
    updateProperty: "lastMonthlyCheckIn",
  });

const yearlyCheckIn = () =>
  doCheckIn({
    period: CHECK_IN_PERIOD_TYPES.yearly,
    updateMethod: updateLocalLastYearlyCheckIn,
    updateProperty: "lastYearlyCheckIn",
  });

const checkIn = () => {
  dailyCheckIn();
  weeklyCheckIn();
  monthlyCheckIn();
  yearlyCheckIn();
};

export default checkIn;

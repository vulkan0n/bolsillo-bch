import moment from "moment";
import {
  updateLocalLastDailyCheckIn,
  updateLocalLastWeeklyCheckIn,
} from "@selene-wallet/app/src/redux/reducers/localReducer";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import store from "@selene-wallet/app/src/redux/store";
import { gql } from "@apollo/client";
import apolloClient from "../../apolloClient";

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($period: String!, $date: String!) {
    sendCheckIn(period: $period, date: $date) {
      status
    }
  }
`;

const doCheckIn = ({
  lastCheckIn,
  checkInWindow,
  period,
  updateMethod,
  updateProperty,
}) => {
  const now = moment.utc();
  const nowFormatted = now.format("YYYYMMDD");

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

const dailyCheckIn = () => {
  const lastDailyCheckIn = store.getState().local.lastDailyCheckIn;

  return doCheckIn({
    lastCheckIn: lastDailyCheckIn,
    checkInWindow: "day",
    period: CHECK_IN_PERIOD_TYPES.daily,
    updateMethod: updateLocalLastDailyCheckIn,
    updateProperty: "lastDailyCheckIn",
  });
};

const weeklyCheckIn = () => {
  const lastWeeklyCheckIn = store.getState().local.lastWeeklyCheckIn;

  return doCheckIn({
    lastCheckIn: lastWeeklyCheckIn,
    checkInWindow: "week",
    period: CHECK_IN_PERIOD_TYPES.weekly,
    updateMethod: updateLocalLastWeeklyCheckIn,
    updateProperty: "lastWeeklyCheckIn",
  });
};

export { dailyCheckIn, weeklyCheckIn };

import moment from "moment";
import {
  updateLocalLastDailyCheckIn,
  updateLocalLastWeeklyCheckIn,
} from "@selene-wallet/app/src/redux/reducers/localReducer";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import store from "@selene-wallet/app/src/redux/store";

const doCheckIn = ({
  lastCheckIn,
  checkInWindow,
  period,
  updateMethod,
  updateProperty,
  sendCheckIn,
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
    sendCheckIn({
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

const dailyCheckIn = ({ sendCheckIn }) => {
  const lastDailyCheckIn = store.getState().local.lastDailyCheckIn;

  return doCheckIn({
    lastCheckIn: lastDailyCheckIn,
    checkInWindow: "day",
    period: CHECK_IN_PERIOD_TYPES.daily,
    updateMethod: updateLocalLastDailyCheckIn,
    updateProperty: "lastDailyCheckIn",
    sendCheckIn,
  });
};

const weeklyCheckIn = ({ sendCheckIn }) => {
  const lastWeeklyCheckIn = store.getState().local.lastWeeklyCheckIn;

  return doCheckIn({
    lastCheckIn: lastWeeklyCheckIn,
    checkInWindow: "week",
    period: CHECK_IN_PERIOD_TYPES.weekly,
    updateMethod: updateLocalLastWeeklyCheckIn,
    updateProperty: "lastWeeklyCheckIn",
    sendCheckIn,
  });
};

export { dailyCheckIn, weeklyCheckIn };

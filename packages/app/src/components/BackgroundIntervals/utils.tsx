import moment from "moment";
import { updateLocalLastDailyCheckIn } from "@selene-wallet/app/src/redux/reducers/localReducer";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";

const dailyCheckIn = ({ lastDailyCheckIn, dispatch, sendCheckIn }) => {
  const now = moment.utc();
  const nowFormatted = now.format("YYYYMMDD");

  const lastDailyCheckInMoment = moment
    .utc(lastDailyCheckIn, "YYYYMMDD")
    .startOf("day")
    .add(1, "s");
  const nextDailyCheckIn = lastDailyCheckInMoment
    .clone()
    .add(1, "day")
    .startOf("day");

  const isShouldCheckInToday =
    lastDailyCheckIn === "" || now.isAfter(nextDailyCheckIn);

  if (isShouldCheckInToday) {
    sendCheckIn({
      variables: {
        period: CHECK_IN_PERIOD_TYPES.daily,
        date: nowFormatted,
      },
    });

    dispatch(
      updateLocalLastDailyCheckIn({
        lastDailyCheckIn: nowFormatted,
      })
    );
  }
};

export { dailyCheckIn };

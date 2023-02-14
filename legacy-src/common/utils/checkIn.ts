import { CHECK_IN_PERIOD_TYPES } from "./consts";
import { CheckInPeriodTypes } from "../types";

const inferCheckInWindow = (period: CheckInPeriodTypes) => {
  switch (period) {
    case CHECK_IN_PERIOD_TYPES.daily:
      return "day";
    case CHECK_IN_PERIOD_TYPES.weekly:
      return "week";
    case CHECK_IN_PERIOD_TYPES.monthly:
      return "month";
    case CHECK_IN_PERIOD_TYPES.yearly:
      return "year";
    default:
      return "day";
  }
};

export default inferCheckInWindow;

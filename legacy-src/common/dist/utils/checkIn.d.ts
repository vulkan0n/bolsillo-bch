import { CheckInPeriodTypes } from "../types";
declare const inferCheckInWindow: (period: CheckInPeriodTypes) => "day" | "week" | "month" | "year";
export default inferCheckInWindow;

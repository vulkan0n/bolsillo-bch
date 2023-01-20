import { TaggedCashAddressType } from "..";
export interface LocalState {
    lastSentTransactionHash: string;
    lastDailyCheckIn: string;
    lastWeeklyCheckIn: string;
    lastMonthlyCheckIn: string;
    lastYearlyCheckIn: string;
    subscribedCashAddress: TaggedCashAddressType[];
}

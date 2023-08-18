import React, { useEffect } from "react";
import { AppstoreOutlined } from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import moment from "moment";
import { useCountdown } from "./useCountdown";
import DailyActiveUsersChart from "./DailyActiveUsersChart";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS } from "@/util/time";
import { ONE_HUNDRED, TEN_MILLION } from "@/util/numbers";

export default function ExploreView() {
  const { loading, error, data, startPolling, stopPolling } = useQuery(
    GET_ACTIVE_BITCOINERS,
    {
      variables: {
        period: "DAILY",
      },
    }
  );

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, []);

  console.log({ data });

  const activeBitcoiners =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 1;
  const missionPercentage = parseFloat(
    ((ONE_HUNDRED / TEN_MILLION) * activeBitcoiners).toFixed(5)
  );

  const midnightUtc = moment().utc().endOf("day");
  const [days, hours, minutes, seconds] = useCountdown(midnightUtc);
  const tenMillionTarget = 10000000;

  const dailyActiveUsersToday = 1;
  const dailyActiveUsersTodayPercentage =
    (100 / tenMillionTarget) * dailyActiveUsersToday;
  // https://stackoverflow.com/a/12830454/2792268
  // +1 to round up
  const dailyActiveUsersTodayWidth =
    (+dailyActiveUsersTodayPercentage.toFixed(2)).toString() + 1;

  const dailyActiveUsersYesterday = 100;
  const dailyActiveUsersYesterdayPercentage =
    (100 / tenMillionTarget) * dailyActiveUsersYesterday;
  // https://stackoverflow.com/a/12830454/2792268
  // +1 to round up
  const dailyActiveUsersYesterdayWidth =
    (+dailyActiveUsersYesterdayPercentage.toFixed(2)).toString() + 1;

  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore" />
      <div className="p-2">
        <div className="stats shadow rounded-lg p-3 bg-zinc-800 w-full">
          <div className="text-2xl font-bold text-zinc-300">
            Global Bitcoin Cash Adoption
          </div>
          <div className="stat">
            <div className="stat-title text-zinc-300">
              Daily Active Selene Users
            </div>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-base font-small text-zinc-300">
              <div className="text-primary">Today</div>
              <div className="text-xs">
                ({hours}h {minutes}m {seconds}s remaining)
              </div>
            </span>
            <span className="text-sm font-small text-primary mt-5">
              {dailyActiveUsersToday}{" "}
              <span className="text-zinc-300">of 10 million (</span>
              {dailyActiveUsersTodayPercentage}%
              <span className="text-zinc-300">)</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4.5 dark:bg-gray-500">
            <div
              className="bg-green-200 h-2.5 rounded-full"
              style={{ width: `${dailyActiveUsersTodayWidth}%` }}
            ></div>
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${dailyActiveUsersYesterdayWidth}%` }}
            ></div>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-primary">
              Yesterday
            </span>
            <span className="text-sm font-medium text-primary">
              {dailyActiveUsersYesterday}{" "}
              <span className="text-zinc-300">of 10 million (</span>
              {dailyActiveUsersYesterdayPercentage}%
              <span className="text-zinc-300">)</span>
            </span>
          </div>
        </div>
        <DailyActiveUsersChart />
      </div>
    </>
  );
}

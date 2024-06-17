/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { DateTime } from "luxon";

import { useCountdown } from "./useCountdown";
import ActiveUsersChart from "./ActiveUsersChart";
import DailyTarget from "./DailyTarget";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS } from "@/util/time";
import { ONE_HUNDRED, TEN_MILLION } from "@/util/numbers";
import { PERIODS } from "@/util/time"

export default function StatsView() {
  const [period, setPeriod] = useState(PERIODS.DAILY)

  const {
    loading: isLoading,
    data,
    startPolling,
    stopPolling,
  } = useQuery(GET_ACTIVE_BITCOINERS, {
    variables: {
      period,
    },
  });

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, [startPolling, stopPolling]);

  const midnightUtc = DateTime.utc().endOf("day");
  const [days, hours, minutes, seconds] = useCountdown(midnightUtc); // eslint-disable-line @typescript-eslint/no-unused-vars

  const dailyActiveUsersToday =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 1;
  const dailyActiveUsersTodayPercentage =
    (ONE_HUNDRED / TEN_MILLION) * dailyActiveUsersToday;
  const fixedDailyActiveUsersTodayPercentage =
    dailyActiveUsersTodayPercentage.toFixed(5);
  // https://stackoverflow.com/a/12830454/2792268
  // +1 to round up
  const dailyActiveUsersTodayWidth =
    (+dailyActiveUsersTodayPercentage.toFixed(2)).toString() + 1;

  const dailyActiveUsersYesterday =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 2]?.count || 1;
  const dailyActiveUsersYesterdayPercentage =
    (ONE_HUNDRED / TEN_MILLION) * dailyActiveUsersYesterday;
  const fixedDailyActiveUsersYesterdayPercentage =
    dailyActiveUsersYesterdayPercentage.toFixed(5);
  // https://stackoverflow.com/a/12830454/2792268
  // +1 to round up
  const dailyActiveUsersYesterdayWidth =
    (+dailyActiveUsersYesterdayPercentage.toFixed(2)).toString() + 1;

  const isReady = !isLoading && data?.activeBitcoiners;

  return (
    <div className="p-2">
      <div className="stats shadow rounded-lg p-3 bg-zinc-100 w-full">
        <div className="text-2xl font-bold text-zinc-800">
          Global Bitcoin Cash Adoption
        </div>
        <div className="stat">
          <div className="stat-title text-zinc-800">
            Active Selene Users
          </div>
        </div>

        <div className="bg-zinc-200 mt-3 mb-3">
          {!isReady && <p>Loading chart...</p>}
          {isReady && <ActiveUsersChart data={data} isYearly={period === PERIODS.YEARLY} />}
        </div>

        <div className="w-full flex justify-center align-center">
          <button
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(PERIODS.DAILY)
            }}
          >
            <span className={`${period === PERIODS.DAILY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.DAILY}
            </span>
          </button>
          <button
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(PERIODS.WEEKLY)
            }}
          >
            <span className={`${period === PERIODS.WEEKLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.WEEKLY}
            </span>
          </button>
          <button
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(PERIODS.MONTHLY)
            }}
          >
            <span className={`${period === PERIODS.MONTHLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.MONTHLY}
            </span>
          </button>
          <button
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(PERIODS.YEARLY)
            }}
          >
            <span className={`${period === PERIODS.YEARLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.YEARLY}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { DateTime } from "luxon";

import { useCountdown } from "./useCountdown";
import ActiveUsersChart from "./ActiveUsersChart";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS } from "@/util/time";
import { ONE_HUNDRED, TEN_MILLION } from "@/util/numbers";

const PERIODS = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY"
}

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

        <div>
          <button
            onClick={() => {
              setPeriod(PERIODS.DAILY)
            }}
          >
            <span className={`${period === PERIODS.DAILY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.DAILY}
            </span>
          </button>
          <button
            onClick={() => {
              setPeriod(PERIODS.WEEKLY)
            }}
          >
            <span className={`${period === PERIODS.WEEKLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.WEEKLY}
            </span>
          </button>
          <button
            onClick={() => {
              setPeriod(PERIODS.MONTHLY)
            }}
          >
            <span className={`${period === PERIODS.MONTHLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.MONTHLY}
            </span>
          </button>
          <button
            onClick={() => {
              setPeriod(PERIODS.YEARLY)
            }}
          >
            <span className={`${period === PERIODS.YEARLY ? 'text-primary' : 'text-zinc-400'}`}>
              {PERIODS.YEARLY}
            </span>
          </button>
        </div>

        <div className="bg-zinc-200 mt-3 mb-3">
          {!isReady && <p>Loading chart...</p>}
          {isReady && <ActiveUsersChart data={data} isYearly={period === PERIODS.YEARLY} />}
        </div>

        <div className="flex justify-between mb-1">
          <span className="text-base font-small text-zinc-800">
            <div className="text-base font-medium text-secondary">Today</div>
            <div className="text-xs">
              ({hours}h {minutes}m {seconds}s remaining)
            </div>
          </span>
          <span className="text-sm font-medium text-secondary mt-5">
            {dailyActiveUsersToday}{" "}
            <span className="text-zinc-800">of 10 million (</span>
            {fixedDailyActiveUsersTodayPercentage}%
            <span className="text-zinc-800">)</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4.5 dark:bg-gray-250">
          <div
            className="bg-green-200 h-2.5 rounded-full"
            style={{ width: `${dailyActiveUsersTodayWidth}%` }}
          />
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${dailyActiveUsersYesterdayWidth}%` }}
          />
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-secondary">
            Yesterday
          </span>
          <span className="text-sm font-medium text-secondary">
            {dailyActiveUsersYesterday}{" "}
            <span className="text-zinc-800">of 10 million (</span>
            {fixedDailyActiveUsersYesterdayPercentage}%
            <span className="text-zinc-800">)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import ActiveUsersChart from "./ActiveUsersChart";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS } from "@/util/time";
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

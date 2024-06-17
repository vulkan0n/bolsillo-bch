import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { THIRTY_SECONDS } from "@/util/time";
import GET_ACTIVE_BITCOINERS_SUMMARY from "./stats/getActiveBitcoinersSummary";

export default function ExploreStatBlock() {
  const {
    loading: isLoading,
    data,
    startPolling,
    stopPolling,
  } = useQuery(GET_ACTIVE_BITCOINERS_SUMMARY);

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, [startPolling, stopPolling]);

  console.log({
    data
  })

  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex-column justify-between items-center" >
      <div className="w-full flex justify-center items-center">
        <span className="font-bold text-xl text-zinc-300">Selene Active Users</span>
      </div>
      <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
        <Link to="/explore/stats/#d">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 24h</div>
            <div className="text-primary text-lg font-semibold">
              {isLoading && "..."}
              {!isLoading && "1337"}
            </div>
            <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>
        </Link>

        <Link to="/explore/stats/#w">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 7d</div>
            <div className="text-primary text-lg font-semibold">23,505</div>
            <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>
        </Link>

        <Link to="/explore/stats/#m">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 30d</div>
            <div className="text-primary text-lg font-semibold">23,505</div>
            <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>
        </Link>

        <Link to="/explore/stats/#y">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 365d</div>
            <div className="text-primary text-lg font-semibold">23,505</div>
            <div className="text-xs text-zinc-400">↗︎ $0.42 (3%)</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

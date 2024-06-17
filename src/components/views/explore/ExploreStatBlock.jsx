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

  if (isLoading) {
    return <p>Loading...</p>
  }

  const {
    dailyActiveCount,
    dailyActivePreviousCount,
    weeklyActiveCount,
    weeklyActivePreviousCount,
    monthlyActiveCount,
    monthlyActivePreviousCount,
    yearlyActiveCount,
    yearlyActivePreviousCount,
  } = data.activeBitcoinersSummary

  const dailyChange = dailyActiveCount - dailyActivePreviousCount
  const dailyChangePercentage = (100 / dailyActiveCount * dailyChange) || 0
  const isDailyActiveIncrease = dailyChange >= 0

  const weeklyChange = weeklyActiveCount - weeklyActivePreviousCount
  const weeklyChangePercentage = (100 / weeklyActiveCount * weeklyChange) || 0
  const isWeeklyActiveIncrease = weeklyChange >= 0

  const monthlyChange = monthlyActiveCount - monthlyActivePreviousCount
  const monthlyChangePercentage = (100 / monthlyActiveCount * monthlyChange) || 0
  const isMonthlyActiveIncrease = monthlyChange >= 0

  const yearlyChange = yearlyActiveCount - yearlyActivePreviousCount
  const yearlyChangePercentage = (100 / yearlyActiveCount * yearlyChange) || 0
  const isYearlyActiveIncrease = yearlyChange >= 0

  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex-column justify-between items-center" >
      <div className="w-full flex justify-center items-center">
        <span className="font-bold text-xl text-zinc-300">Selene Active Users</span>
      </div>
      <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
        <Link to="/explore/stats/#d">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Daily</div>
            <div className={`${isDailyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}>
              {dailyActiveCount}
            </div>
            <div className={`text-xs ${isDailyActiveIncrease ? "text-primary" : "text-red-500"}`}>
              {isDailyActiveIncrease ? "↑" : "↓"} {isDailyActiveIncrease && "+"}{dailyChange} ({isDailyActiveIncrease && "+"}{dailyChangePercentage}%)
            </div>
          </div>
        </Link>

        <Link to="/explore/stats/#w">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Weekly</div>
            <div className={`${isWeeklyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}>
              {weeklyActiveCount}
            </div>
            <div className={`text-xs ${isWeeklyActiveIncrease ? "text-primary" : "text-red-500"}`}>
              {isWeeklyActiveIncrease ? "↑" : "↓"} {isWeeklyActiveIncrease && "+"}{weeklyChange} ({isWeeklyActiveIncrease && "+"}{weeklyChangePercentage}%)
            </div>
          </div>
        </Link>

        <Link to="/explore/stats/#w">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Monthly</div>
            <div className={`${isMonthlyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}>
              {monthlyActiveCount}
            </div>
            <div className={`text-xs ${isMonthlyActiveIncrease ? "text-primary" : "text-red-500"}`}>
              {isMonthlyActiveIncrease ? "↑" : "↓"} {isMonthlyActiveIncrease && "+"}{monthlyChange} ({isMonthlyActiveIncrease && "+"}{monthlyChangePercentage}%)
            </div>
          </div>
        </Link>

        <Link to="/explore/stats/#y">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Yearly</div>
            <div className={`${isYearlyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}>
              {yearlyActiveCount}
            </div>
            <div className={`text-xs ${isYearlyActiveIncrease ? "text-primary" : "text-red-500"}`}>
              {isYearlyActiveIncrease ? "↑" : "↓"} {isYearlyActiveIncrease && "+"}{yearlyChange} ({isYearlyActiveIncrease && "+"}{yearlyChangePercentage}%)
            </div>
          </div>
        </Link>
      </div >
    </div >
  );
}

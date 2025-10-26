import { useEffect } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { selectCurrentPrice } from "@/redux/exchangeRates";
import GET_ACTIVE_BITCOINERS_SUMMARY from "@/apps/stats/getActiveBitcoinersSummary";
import { THIRTY_SECONDS } from "@/util/time";

import { translate } from "@/util/translations";
import  translations  from "@/views/explore/translations";

export default function ExploreStatWidget() {
  const price = useSelector(selectCurrentPrice);

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

  const isDataUnavailable = isLoading || !data;

  const {
    dailyActiveCount,
    dailyActivePreviousCount,
    monthlyActiveCount,
    monthlyActivePreviousCount,
  } = data?.activeBitcoinersSummary || {};

  const dailyChange = dailyActiveCount - dailyActivePreviousCount;
  const dailyChangePercentage =
    ((100 / dailyActivePreviousCount) * dailyChange)?.toFixed(1) || 0;
  const isDailyActiveIncrease = dailyChange >= 0;

  const monthlyChange = monthlyActiveCount - monthlyActivePreviousCount;
  const monthlyChangePercentage =
    ((100 / monthlyActivePreviousCount) * monthlyChange)?.toFixed(1) || 0;
  const isMonthlyActiveIncrease = monthlyChange >= 0;

  return (
    <div className="p-2 rounded bg-primary-100 flex justify-between items-center border border-primary-700 dark:bg-neutral-800 dark:border-primarydark-200">
      <Link to="/apps/stats/#d">
        <div className="p-1 mx-1">
          <div className="font-bold text-neutral-800 dark:text-neutral-200">
            {translate(translations.dailyUsers)}
          </div>
          <div
            className={`${isDailyActiveIncrease ? "text-success" : "text-error"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : dailyActiveCount}
          </div>
          <div
            className={`text-xs ${isDailyActiveIncrease ? "text-success" : "text-error"}`}
          >
            {isDailyActiveIncrease ? "↑" : "↓"} {isDailyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : dailyChange} (
            {isDailyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : dailyChangePercentage}%)
          </div>
        </div>
      </Link>

      <Link to="/apps/stats/#m">
        <div className="p-1 mx-1">
          <div className="font-bold text-neutral-800 dark:text-neutral-200">
            {translate(translations.monthlyUsers)}
          </div>
          <div
            className={`${isMonthlyActiveIncrease ? "text-success" : "text-error"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : monthlyActiveCount}
          </div>
          <div
            className={`text-xs ${isMonthlyActiveIncrease ? "text-success" : "text-error"}`}
          >
            {isMonthlyActiveIncrease ? "↑" : "↓"}{" "}
            {isMonthlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : monthlyChange} (
            {isMonthlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : monthlyChangePercentage}%)
          </div>
        </div>
      </Link>

      {/*<Link to="/apps/price">*/}
      <div className="p-1 mx-1">
        <div className="font-bold text-neutral-800 dark:text-neutral-200">
          BCH/{price.currency}
        </div>
        <div className="text-neutral-600 text-lg font-semibold dark:text-neutral-100/90">
          {price.priceString}
        </div>
        <div className="text-xs text-neutral-400">&nbsp;</div>
      </div>
      {/*</Link>*/}
    </div>
  );
}

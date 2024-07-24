import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { Period, THIRTY_SECONDS } from "@/util/time";

import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";

export default function ExploreStatsView() {
  const [period, setPeriod] = useState(Period.Daily);

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
      <ExploreStatBlock />
      <GlobalAdoptionSummary />
    </div>
  );
}

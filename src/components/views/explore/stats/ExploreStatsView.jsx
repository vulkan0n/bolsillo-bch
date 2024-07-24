import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_BITCOINERS } from "@/graphql/queries";
import { Period } from "@/constants";
import { THIRTY_SECONDS } from "@/constants";

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

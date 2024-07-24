import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { Period, THIRTY_SECONDS } from "@/util/time";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../../../../../src/apolloClient";

import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";

export default function ExploreStatsView() {
  return (
    <ApolloProvider client={apolloClient}>
      <div className="p-2">
        <ExploreStatBlock />
        <GlobalAdoptionSummary />
      </div>
    </ApolloProvider>
  );
}

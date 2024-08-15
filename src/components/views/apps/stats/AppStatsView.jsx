import { ApolloProvider } from "@apollo/client";

import ExploreStatsBlock from "@/apps/stats/ExploreStatBlock";
import ExploreStatsView from "@/apps/stats/ExploreStatsView";
import apolloClient from "@/apolloClient";

export default function AppStatsView() {
  return (
    <ApolloProvider client={apolloClient}>
      <ExploreStatsBlock />
      <ExploreStatsView />
    </ApolloProvider>
  );
}

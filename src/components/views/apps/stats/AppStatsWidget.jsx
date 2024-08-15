import { lazy as ReactLazy, Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@/apolloClient";

const ExploreStatsBlock = ReactLazy(
  () => import("@/apps/stats/ExploreStatBlock")
);

const ExploreStatsView = ReactLazy(
  () => import("@/apps/stats/ExploreStatsView")
);

export default function AppStatsView() {
  return (
    <ApolloProvider client={apolloClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <ExploreStatsBlock />
        <ExploreStatsView />
      </Suspense>
    </ApolloProvider>
  );
}

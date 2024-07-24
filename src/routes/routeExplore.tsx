import { Geolocation } from "@capacitor/geolocation";

import TransactionManagerService from "@/services/TransactionManagerService";

export const routeExplore = [
  {
    path: "/explore",
    async lazy() {
      const { default: ExploreView } = await import(
        "@/views/explore/ExploreView"
      );
      return { Component: ExploreView };
    },
    children: [
      {
        index: true,
        async lazy() {
          const { default: ExploreViewHome } = await import(
            "@/views/explore/ExploreViewHome"
          );
          return { Component: ExploreViewHome };
        },
      },
      {
        path: "tx/:txid",
        async lazy() {
          const { default: ExploreTransactionView } = await import(
            "@/views/explore/ExploreTransactionView"
          );
          return { Component: ExploreTransactionView };
        },
        loader: async ({ params }) => {
          return TransactionManagerService().resolveTransaction(params.txid);
        },
      },
      {
        path: "stats",
        async lazy() {
          const { default: ExploreStatsView } = await import(
            "@/views/explore/stats/ExploreStatsView"
          );
          return { Component: ExploreStatsView };
        },
      },
      {
        path: "socialMedia",
        async lazy() {
          const { default: ExploreSocialMediaView } = await import(
            "@/views/explore/socialMedia/ExploreSocialMediaView"
          );
          return { Component: ExploreSocialMediaView };
        },
      },
      {
        path: "afog",
        async lazy() {
          const { default: ExploreAfogView } = await import(
            "@/views/explore/afog/ExploreAfogView"
          );
          return { Component: ExploreAfogView };
        },
      },
      {
        path: "map",
        async lazy() {
          const { default: ExploreMapView } = await import(
            "@/views/explore/map/ExploreMapView"
          );
          return { Component: ExploreMapView };
        },
        loader: async () =>
          Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
          }),
      },
      {
        path: "contacts",
        async lazy() {
          const { default: ExploreContactsView } = await import(
            "@/views/explore/contacts/ExploreContactsView"
          );
          return { Component: ExploreContactsView };
        },
      },
      {
        path: "help",
        async lazy() {
          const { default: ExploreHelpView } = await import(
            "@/views/explore/help/ExploreHelpView"
          );
          return { Component: ExploreHelpView };
        },
      },
      {
        path: "price",
        async lazy() {
          const { default: ExplorePriceView } = await import(
            "@/views/explore/price/ExplorePriceView"
          );
          return { Component: ExplorePriceView };
        },
      },
    ],
  },
];

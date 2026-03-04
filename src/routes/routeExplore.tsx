//import { Geolocation } from "@capacitor/geolocation";

import { selectBchNetwork } from "@/redux/preferences";
import { store } from "@/redux";

import TransactionManagerService from "@/kernel/bch/TransactionManagerService";

import ExploreView from "@/views/explore/ExploreView";
import ExploreViewHome from "@/views/explore/ExploreViewHome";

export const routeExplore = [
  {
    path: "/explore",
    element: <ExploreView />,
    children: [
      {
        index: true,
        element: <ExploreViewHome />,
      },
      {
        path: "tx/:tx_hash",
        async lazy() {
          const { default: ExploreTransactionView } =
            await import("@/views/explore/ExploreTransactionView");
          return { Component: ExploreTransactionView };
        },
        loader: async ({ params }) => {
          const bchNetwork = selectBchNetwork(store.getState());
          return TransactionManagerService().resolveTransaction(
            params.tx_hash,
            bchNetwork
          );
        },
      },
      /*{
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
      },*/
      {
        path: "contacts",
        async lazy() {
          const { default: ExploreContactsView } =
            await import("@/views/explore/contacts/ExploreContactsView");
          return { Component: ExploreContactsView };
        },
      },
    ],
  },
];

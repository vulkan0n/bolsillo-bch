//import { Geolocation } from "@capacitor/geolocation";

import ExploreView from "@/views/explore/ExploreView";
import ExploreViewHome from "@/views/explore/ExploreViewHome";

import TransactionManagerService from "@/services/TransactionManagerService";

import { selectBchNetwork } from "@/redux/preferences";
import { store } from "@/redux";

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
        path: "tx/:txid",
        async lazy() {
          const { default: ExploreTransactionView } =
            await import("@/views/explore/ExploreTransactionView");
          return { Component: ExploreTransactionView };
        },
        loader: async ({ params }) => {
          const bchNetwork = selectBchNetwork(store.getState());
          return TransactionManagerService().resolveTransaction(
            params.txid,
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

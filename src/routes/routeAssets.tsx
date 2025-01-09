import { Navigate } from "react-router";
import AssetsView from "@/views/assets/AssetsView";
import AssetsViewAddresses from "@/views/assets/AssetsViewAddresses";
import AssetsViewCoins from "@/views/assets/AssetsViewCoins";
import AssetsViewTokens from "@/views/assets/AssetsViewTokens";
import AssetsViewCollections from "@/views/assets/AssetsViewCollections";

export const routeAssets = [
  {
    path: "/assets",
    element: <AssetsView />,
    children: [
      {
        index: true,
        element: <Navigate to="/assets/addresses" replace />,
      },
      {
        path: "addresses/",
        element: <AssetsViewAddresses />,
      },
      {
        path: "coins/",
        element: <AssetsViewCoins />,
      },
      {
        path: "tokens/",
        element: <AssetsViewTokens />,
      },
      {
        path: "collections/",
        element: <AssetsViewCollections />,
      },
    ],
  },
];

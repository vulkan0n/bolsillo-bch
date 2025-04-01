import AssetsView from "@/views/assets/AssetsView";
import AssetsViewCoins from "@/views/assets/AssetsViewCoins";
import AssetsViewTokens from "@/views/assets/AssetsViewTokens";
import AssetsViewTokenDetail from "@/views/assets/AssetsViewTokenDetail";

export const routeAssets = [
  {
    path: "/assets",
    element: <AssetsView />,
    children: [
      {
        path: "coins/",
        element: <AssetsViewCoins />,
      },
      {
        path: "tokens/",
        element: <AssetsViewTokens />,
      },
      {
        path: "tokens/:tokenId",
        element: <AssetsViewTokenDetail />,
      },
    ],
  },
];

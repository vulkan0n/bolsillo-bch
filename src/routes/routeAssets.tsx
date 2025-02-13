import AssetsView from "@/views/assets/AssetsView";
import AssetsViewCoins from "@/views/assets/AssetsViewCoins";
import AssetsViewTokens from "@/views/assets/AssetsViewTokens";

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
    ],
  },
];

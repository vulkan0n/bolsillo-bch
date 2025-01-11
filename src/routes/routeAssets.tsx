import AssetsView from "@/views/assets/AssetsView";
import AssetsViewHome from "@/views/assets/AssetsViewHome";
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
        element: <AssetsViewHome />,
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

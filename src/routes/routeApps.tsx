import AssetsView from "@/views/assets/AssetsView";

export const routeApps = [
  {
    path: "/apps",
    element: <AssetsView />,
  },
  {
    path: "stats",
    async lazy() {
      const { default: AppStatsView } = await import(
        "@/views/apps/stats/AppStatsView"
      );
      return { Component: AppStatsView };
    },
  },
  {
    path: "price",
    async lazy() {
      const { default: AppPriceView } = await import(
        "@/views/apps/price/AppPriceView"
      );
      return { Component: AppPriceView };
    },
  },
];

import AppsView from "@/views/apps/AppsView";

export const routeApps = [
  {
    path: "/apps",
    element: <AppsView />,
  },
  {
    path: "/apps/stats",
    async lazy() {
      const { default: AppStatsView } = await import(
        "@/views/apps/stats/AppStatsView"
      );
      return { Component: AppStatsView };
    },
  },
  {
    path: "/apps/price",
    async lazy() {
      const { default: AppPriceView } = await import(
        "@/views/apps/price/AppPriceView"
      );
      return { Component: AppPriceView };
    },
  },
  {
    path: "/apps/afog",
    async lazy() {
      const { default: AppAfogView } = await import(
        "@/views/apps/afog/AppAfogView"
      );
      return { Component: AppAfogView };
    },
  },
  {
    path: "/apps/bliss",
    async lazy() {
      const { default: AppBlissView } = await import(
        "@/views/apps/bliss/AppBlissView"
      );
      return { Component: AppBlissView };
    },
  },
  {
    path: "/apps/qrgen",
    async lazy() {
      const { default: AppQrgenView } = await import(
        "@/views/apps/qrgen/AppQrgenView"
      );
      return { Component: AppQrgenView };
    },
  },
  {
    path: "/apps/walletconnect",
    async lazy() {
      const { default: AppWalletConnectView } = await import(
        "@/views/apps/walletconnect/AppWalletConnectView"
      );
      return { Component: AppWalletConnectView };
    },
  },
];

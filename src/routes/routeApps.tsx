//import BlissTicketsView from "@/components/views/apps/bliss/tickets/BlissTicketsView";
//import BlissTokenHuntView from "@/components/views/apps/bliss/tokenHunt/BlissTokenHuntView";
import AppsView from "@/views/apps/AppsView";
//import AppBlissView from "@/views/apps/bliss/AppBlissView";
import AppBlazeView from "@/views/apps/blaze/AppBlazeView";
//import BlissAboutView from "@/views/apps/bliss/about/BlissAboutView";
//import BlazeAboutView from "@/views/apps/blaze/about/BlazeAboutView";

export const routeApps = [
  {
    path: "/apps",
    element: <AppsView />,
  },
  {
    path: "/apps/intro",
    async lazy() {
      const { default: AppIntroVideoView } =
        await import("@/views/apps/intro/AppIntroVideoView");
      return { Component: AppIntroVideoView };
    },
  },
  {
    path: "/apps/stats",
    async lazy() {
      const { default: AppStatsView } =
        await import("@/views/apps/stats/AppStatsView");
      return { Component: AppStatsView };
    },
  },
  {
    path: "/apps/price",
    async lazy() {
      const { default: AppPriceView } =
        await import("@/views/apps/price/AppPriceView");
      return { Component: AppPriceView };
    },
  },
  {
    path: "/apps/afog",
    async lazy() {
      const { default: AppAfogView } =
        await import("@/views/apps/afog/AppAfogView");
      return { Component: AppAfogView };
    },
  },
  {
    path: "/apps/blaze",
    element: <AppBlazeView />,
  },
  /*{
    path: "/apps/bliss",
    element: <AppBlissView />,
    children: [
      {
        path: "about/",
        element: <BlissAboutView />,
      },
      {
        path: "tickets/",
        element: <BlissTicketsView />,
      },
      {
        path: "tokenHunt",
        element: <BlissTokenHuntView />,
      },
    ],
    },*/
  {
    path: "/apps/cauldron",
    async lazy() {
      const { default: AppCauldronDexView } =
        await import("@/views/apps/cauldron/AppCauldronDexView");
      return { Component: AppCauldronDexView };
    },
  },
  {
    path: "/apps/qrgen",
    async lazy() {
      const { default: AppQrgenView } =
        await import("@/views/apps/qrgen/AppQrgenView");
      return { Component: AppQrgenView };
    },
  },
  {
    path: "/apps/walletconnect",
    async lazy() {
      const { default: AppWalletConnectView } =
        await import("@/views/apps/walletconnect/AppWalletConnectView");
      return { Component: AppWalletConnectView };
    },
  },
];

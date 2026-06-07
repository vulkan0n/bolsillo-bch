import WalletViewHome from "@/views/wallet/home/WalletViewHome";
import WalletViewPay from "@/views/wallet/send/WalletViewPay";
import WalletViewSweep from "@/views/wallet/send/WalletViewSweep";
import WalletView from "@/views/wallet/WalletView";

export const routeWallet = [
  {
    path: "/wallet",
    element: <WalletView />,
    children: [
      {
        index: true,
        element: <WalletViewHome />,
      },
      {
        path: "pay/",
        element: <WalletViewPay />,
      },
      {
        path: "sweep/:wif",
        element: <WalletViewSweep />,
      },
      {
        path: "history",
        async lazy() {
          const { default: WalletViewHistory } =
            await import("@/views/wallet/history/WalletViewHistory");
          return { Component: WalletViewHistory };
        },
      },
      {
        path: "receive",
        async lazy() {
          const { default: WalletViewReceive } =
            await import("@/views/wallet/receive/WalletViewReceive");
          return { Component: WalletViewReceive };
        },
      },
      {
        path: "send/scan",
        async lazy() {
          const { default: SendScanView } =
            await import("@/views/wallet/send/SendScanView");
          return { Component: SendScanView };
        },
      },
      {
        path: "send/amount",
        async lazy() {
          const { default: SendAmountView } =
            await import("@/views/wallet/send/SendAmountView");
          return { Component: SendAmountView };
        },
      },
      {
        path: "send/confirm",
        async lazy() {
          const { default: SendPlaceholder } =
            await import("@/views/wallet/send/SendPlaceholder");
          return { Component: SendPlaceholder };
        },
      },
      {
        path: "send/success",
        async lazy() {
          const { default: SendPlaceholder } =
            await import("@/views/wallet/send/SendPlaceholder");
          return { Component: SendPlaceholder };
        },
      },
    ],
  },
];

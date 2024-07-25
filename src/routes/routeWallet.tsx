import WalletView from "@/views/wallet/WalletView";
import WalletViewHome from "@/views/wallet/WalletViewHome/WalletViewHome";
import WalletViewSend from "@/views/wallet/WalletViewSend/WalletViewSend";

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
        path: "send/:address",
        element: <WalletViewSend />,
      },
      {
        path: "send/success",
        async lazy() {
          const { default: WalletViewSendSuccess } = await import(
            "@/views/wallet/WalletViewSendSuccess/WalletViewSendSuccess"
          );
          return { Component: WalletViewSendSuccess };
        },
      },
      {
        path: "history",
        async lazy() {
          const { default: WalletViewHistory } = await import(
            "@/views/wallet/WalletViewHistory/WalletViewHistory"
          );
          return { Component: WalletViewHistory };
        },
      },
    ],
  },
];

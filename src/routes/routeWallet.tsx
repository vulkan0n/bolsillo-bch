import WalletView from "@/views/wallet/WalletView";
import WalletViewHome from "@/views/wallet/home/WalletViewHome";
import WalletViewSend from "@/views/wallet/send/WalletViewSend";
import WalletViewPay from "@/views/wallet/send/WalletViewPay";
import WalletViewSweep from "@/views/wallet/send/WalletViewSweep";
import WalletViewSendSuccess from "@/views/wallet/send/WalletViewSendSuccess";

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
        path: "send/",
        element: <WalletViewSend />,
      },
      {
        path: "send/:address",
        element: <WalletViewSend />,
      },
      {
        path: "pay/",
        element: <WalletViewPay />,
      },
      {
        path: "send/success",
        element: <WalletViewSendSuccess />,
      },
      {
        path: "sweep/:wif",
        element: <WalletViewSweep />,
      },
      {
        path: "history",
        async lazy() {
          const { default: WalletViewHistory } = await import(
            "@/views/wallet/history/WalletViewHistory"
          );
          return { Component: WalletViewHistory };
        },
      },
    ],
  },
];

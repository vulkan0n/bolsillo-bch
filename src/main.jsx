import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import "./index.css";

import MainLayout from "./components/MainLayout";
import WalletView from "./components/views/WalletView";
import WalletViewReceive from "./components/views/walletView/WalletViewReceive";
import WalletViewSend from "./components/views/walletView/WalletViewSend";
import WalletViewSendConfirm from "./components/views/walletView/WalletViewSendConfirm";
import ExploreView from "./components/views/ExploreView";
import SettingsView from "./components/views/SettingsView";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/wallet" />,
      },
      {
        path: "/wallet",
        element: <WalletView />,
        children: [
          {
            path: "send",
            element: <WalletViewSend />,
          },
          {
            path: "send/:address",
            element: <WalletViewSendConfirm />,
          },
          {
            index: true,
            element: <WalletViewReceive />,
          },
        ],
      },
      {
        path: "/explore",
        element: <ExploreView />,
      },
      {
        path: "/settings",
        element: <SettingsView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

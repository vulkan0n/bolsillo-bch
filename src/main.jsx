import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { store } from "./redux";

import "./index.css";

import MainLayout from "./components/MainLayout";
import WalletView from "./components/views/WalletView";
import WalletViewReceive from "./components/views/walletView/WalletViewReceive";
import WalletViewSend from "./components/views/walletView/WalletViewSend";
import WalletViewSendConfirm from "./components/views/walletView/WalletViewSendConfirm";
import WalletViewSendSuccess from "./components/views/walletView/WalletViewSendSuccess";
import ExploreView from "./components/views/ExploreView";
import SettingsView from "./components/views/SettingsView";
import SettingsWalletView from "./components/views/settingsView/SettingsWalletView";
import SettingsWalletWizard from "./components/views/settingsView/SettingsWalletWizard";
import SettingsWalletWizardInit from "./components/views/settingsView/SettingsWalletWizardInit";
import SettingsWalletWizardImport from "./components/views/settingsView/SettingsWalletWizardImport";

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
            path: "send/success",
            element: <WalletViewSendSuccess />,
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
      {
        path: "/settings/wallet/:wallet_id",
        element: <SettingsWalletView />,
      },
      {
        path: "/settings/wallet/wizard",
        element: <SettingsWalletWizard />,
        children: [
          {
            index: true,
            element: <SettingsWalletWizardInit />,
          },
          {
            path: "import",
            element: <SettingsWalletWizardImport />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

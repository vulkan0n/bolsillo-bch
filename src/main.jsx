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
import WalletViewHome from "./components/views/walletView/WalletViewHome/WalletViewHome";
import WalletViewHistory from "./components/views/walletView/WalletViewHistory/WalletViewHistory";
import WalletViewSend from "./components/views/walletView/WalletViewSend/WalletViewSend";
import WalletViewSendSuccess from "./components/views/walletView/WalletViewSendSuccess/WalletViewSendSuccess";
import ExploreView from "./components/views/ExploreView";
import SettingsView from "./components/views/SettingsView";
import SettingsWalletView from "./components/views/settingsView/SettingsWalletView/SettingsWalletView";
import SettingsWalletWizard from "./components/views/settingsView/SettingsWalletWizard/SettingsWalletWizard";
import SettingsWalletWizardInit from "./components/views/settingsView/SettingsWalletWizardInit/SettingsWalletWizardInit";
import SettingsWalletWizardImport from "./components/views/settingsView/SettingsWalletWizardImport/SettingsWalletWizardImport";
import SettingsWalletAdditionalInformation from "./components/views/settingsView/SettingsWalletAdditionalInformation/SettingsWalletAdditionalInformation";
import CreditsView from "./components/views/CreditsView";

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
          /*{
            path: "send",
            element: <WalletViewSend />,
          },*/
          {
            path: "send/:address",
            element: <WalletViewSend />,
          },
          {
            path: "send/success",
            element: <WalletViewSendSuccess />,
          },
          {
            path: "history",
            element: <WalletViewHistory />,
          },
          {
            index: true,
            element: <WalletViewHome />,
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
        path: "/settings/wallet/:wallet_id/additionalInformation",
        element: <SettingsWalletAdditionalInformation />,
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
      {
        path: "/credits",
        element: <CreditsView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Note: Duration has an inbuilt extra 1000ms dismissal delay */}
      <Toaster toastOptions={{ duration: 1000 }} containerClassName="toaster" />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

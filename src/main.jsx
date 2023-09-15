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
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./apolloClient";

import "./index.css";

import MainLayout from "@/layout/MainLayout";
import WalletView from "@/views/wallet/WalletView";
import WalletViewHome from "@/views/wallet/WalletViewHome/WalletViewHome";
import WalletViewHistory from "@/views/wallet/WalletViewHistory/WalletViewHistory";
import WalletViewSend from "@/views/wallet/WalletViewSend/WalletViewSend";
import WalletViewSendSuccess from "@/views/wallet/WalletViewSendSuccess/WalletViewSendSuccess";
import ExploreView from "@/views/explore/ExploreView";
import SettingsView from "@/views/settings/SettingsView";
import SettingsWalletView from "@/views/settings/SettingsWalletView/SettingsWalletView";
import SettingsWalletWizard from "@/views/settings/SettingsWalletWizard/SettingsWalletWizard";
import SettingsWalletWizardInit from "@/views/settings/SettingsWalletWizardInit/SettingsWalletWizardInit";
import SettingsWalletWizardImport from "@/views/settings/SettingsWalletWizardImport/SettingsWalletWizardImport";
import SettingsWalletAdditionalInformation from "@/views/settings/SettingsWalletAdditionalInformation/SettingsWalletAdditionalInformation";
import CreditsView from "@/views/credits/CreditsView";

export const routes = [
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
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        {/* Note: Duration has an inbuilt extra 1000ms dismissal delay */}
        <Toaster
          toastOptions={{ duration: 1000 }}
          containerClassName="toaster"
        />
        <RouterProvider router={router} />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);

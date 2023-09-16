import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { store } from "./redux";
import apolloClient from "./apolloClient";

import "./index.css";

import MainLayout from "@/layout/MainLayout";
import WalletView from "@/views/wallet/WalletView";
import WalletViewHome from "@/views/wallet/WalletViewHome/WalletViewHome";
import WalletViewHistory from "@/views/wallet/WalletViewHistory/WalletViewHistory";
import WalletViewSend from "@/views/wallet/WalletViewSend/WalletViewSend";
import WalletViewSendSuccess from "@/views/wallet/WalletViewSendSuccess/WalletViewSendSuccess";

import ExploreView from "@/views/explore/ExploreView";
import ExploreStatsView from "@/views/explore/ExploreStatsView";
import ExploreContactsView from "@/views/explore/contacts/ExploreContactsView";
import ExploreMapView from "@/views/explore/map/ExploreMapView";

import SettingsView from "@/views/settings/SettingsView";
import SettingsWalletView from "@/views/settings/SettingsWalletView/SettingsWalletView";
import SettingsWalletWizard from "@/views/settings/SettingsWalletWizard/SettingsWalletWizard";
import SettingsWalletWizardInit from "@/views/settings/SettingsWalletWizardInit/SettingsWalletWizardInit";
import SettingsWalletWizardImport from "@/views/settings/SettingsWalletWizardImport/SettingsWalletWizardImport";
import SettingsWalletAdditionalInformation from "@/views/settings/SettingsWalletAdditionalInformation/SettingsWalletAdditionalInformation";

import CreditsView from "@/views/credits/CreditsView";
import AssetsView from "@/views/assets/AssetsView";
import DebugView from "@/views/debug/DebugView";
import HelpView from "@/views/help/HelpView";

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
        children: [
          {
            path: "stats",
            element: <ExploreStatsView />,
          },
          {
            path: "map",
            element: <ExploreMapView />,
          },
          {
            path: "contacts",
            element: <ExploreContactsView />,
          },
        ],
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

      {
        path: "/assets",
        element: <AssetsView />,
      },
      {
        path: "/debug",
        element: <DebugView />,
      },
      {
        path: "/help",
        element: <HelpView />,
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

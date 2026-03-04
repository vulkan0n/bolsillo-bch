import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ApolloProvider } from "@apollo/client";

import { selectIsLocked } from "@/redux/device";

import SecurityService from "@/kernel/app/SecurityService";

import AppLockScreen from "@/views/security/AppLockScreen";
import ErrorBoundary from "@/layout/ErrorBoundary";
import MainLayout from "@/layout/MainLayout";

import apolloClient from "@/apolloClient";

import { routeApps } from "@/routes/routeApps";
import { routeAssets } from "@/routes/routeAssets";
import { routeDebug } from "@/routes/routeDebug";
import { routeExplore } from "@/routes/routeExplore";
import { routeSettings } from "@/routes/routeSettings";
import { routeWallet } from "@/routes/routeWallet";

import "./index.css";

const routes = [
  {
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <Navigate to="/wallet" />,
      },
      ...routeWallet,
      ...routeAssets,
      ...routeExplore,
      ...routeSettings,
      ...routeApps,
      ...routeDebug,
      {
        path: "/credits",
        async lazy() {
          const { default: CreditsView } =
            await import("@/views/credits/CreditsView");
          return { Component: CreditsView };
        },
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function Main() {
  const isLocked = useSelector(selectIsLocked);

  if (!SecurityService().isEncryptionReady() || isLocked) {
    return <AppLockScreen />;
  }

  return (
    <ApolloProvider client={apolloClient}>
      {/* Note: Duration has an inbuilt extra 1000ms dismissal delay */}
      <Toaster toastOptions={{ duration: 1250 }} containerClassName="toaster" />
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}

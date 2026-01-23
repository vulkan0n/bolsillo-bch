import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { useSelector } from "react-redux";

import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@/apolloClient";

import "./index.css";

import MainLayout from "@/layout/MainLayout";
import ErrorBoundary from "@/layout/ErrorBoundary";

import { routeWallet } from "@/routes/routeWallet";
import { routeAssets } from "@/routes/routeAssets";
import { routeExplore } from "@/routes/routeExplore";
import { routeSettings } from "@/routes/routeSettings";
import { routeApps } from "@/routes/routeApps";
import { routeDebug } from "@/routes/routeDebug";

import SecurityService from "@/kernel/app/SecurityService";
import { selectIsLocked } from "@/redux/device";
import AppLockScreen from "@/views/security/AppLockScreen";

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

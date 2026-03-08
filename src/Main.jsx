import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { selectIsLocked } from "@/redux/device";

import AppLockScreen from "@/views/security/AppLockScreen";
import IndexRoute from "@/layout/IndexRoute";
import ErrorBoundary from "@/layout/ErrorBoundary";
import MainLayout from "@/layout/MainLayout";

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
        element: <IndexRoute />,
      },
      ...routeWallet,
      ...routeAssets,
      ...routeExplore,
      ...routeSettings,
      ...routeApps,
      ...routeDebug,
      {
        path: "/vendor",
        async lazy() {
          const { default: VendorModeView } =
            await import("@/views/vendor/VendorModeView");
          return { Component: VendorModeView };
        },
      },
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

  if (isLocked) {
    return <AppLockScreen />;
  }

  return (
    <>
      {/* Note: Duration has an inbuilt extra 1000ms dismissal delay */}
      <Toaster toastOptions={{ duration: 1250 }} containerClassName="toaster" />
      <RouterProvider router={router} />
    </>
  );
}

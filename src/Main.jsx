import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import { store } from "@/redux";

import AppProvider from "@/kernel/app/AppProvider";

import IndexRoute from "@/views/IndexRoute";
import ErrorBoundary from "@/layout/ErrorBoundary";
import MainLayout from "@/layout/MainLayout";

import { routeApps } from "@/routes/routeApps";
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
  return (
    <Provider store={store}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>
);

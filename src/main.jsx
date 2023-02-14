import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";

import "./index.css";

import MainLayout from "./components/MainLayout";
import WalletView from "./components/views/WalletView";
import CommunityView from "./components/views/CommunityView";
import SettingsView from "./components/views/SettingsView";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        loader: () => redirect("/wallet"),
      },
      {
        path: "/wallet/*",
        element: <WalletView />,
      },
      {
        path: "/community",
        element: <CommunityView />,
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

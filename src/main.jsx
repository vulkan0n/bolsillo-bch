import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import MainLayout from "./components/MainLayout";
import MainView from "./components/views/MainView";
import CommunityView from "./components/views/CommunityView";
import SettingsView from "./components/views/SettingsView";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <MainView />,
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

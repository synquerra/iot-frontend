import { createBrowserRouter, Navigate } from "react-router-dom";

import Dashboard from "@/Pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import GuestMiddleware from "./middleware/GuestMiddleware";
import RequireAuth from "./middleware/RequireAuth";
import LoginPage from "./Pages/Auth/login";

import DeviceSettings from "./features/device-settings";
import GeofencingPage from "./features/geofencing";
import DeviceOverviewPage from "./features/device-overview";
import DevicesPage from "./features/devices";
import AlertsPage from "./features/alerts";

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },

          {
            path: "devices",
            children: [
              {
                path: "list",
                element: <DevicesPage />, // /devices/list
              },
              {
                path: "geofencing/:imei?",
                element: <GeofencingPage />, // /devices/geofencing/:imei?
              },
              {
                path: ":imei",
                element: <DeviceOverviewPage />, // /devices/:imei
              },
              {
                path: "settings/:imei?",
                element: <DeviceSettings />, // /devices/settings
              },
            ],
          },
          {
            path: "alerts",
            element: <AlertsPage />,
          },
        ],
      },
    ],
  },

  {
    element: <GuestMiddleware />,
    children: [
      {
        path: "/auth/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

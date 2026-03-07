import { createBrowserRouter } from "react-router-dom";

import Dashboard from "@/Pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import GuestMiddleware from "./middleware/GuestMiddleware";
import RequireAuth from "./middleware/RequireAuth";
import LoginPage from "./Pages/Auth/login";

import DeviceSettings from "./features/device-settings";
import DeviceTelemetryPage from "./features/device-telemetry";
import DevicesPage from "./features/devices";

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
                path: ":imei",
                element: <DeviceTelemetryPage />, // /devices/:imei
              },
              {
                path: "settings/:imei?",
                element: <DeviceSettings />, // /devices/settings
              },
            ],
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
]);

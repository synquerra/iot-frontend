import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Telemetry from "./pages/Telemetry";
import Configuration from "./pages/Configuration";
import DeviceSettings from "./pages/DeviceSettings";
import Geofence from "./pages/Geofence";

import DeviceDetails from "./pages/DeviceDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* TEST ROUTE - Dashboard without authentication (REMOVE IN PRODUCTION) */}
        <Route path="/test-dashboard" element={<Dashboard />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="devices/:imei" element={<DeviceDetails />} />
          <Route path="devices/:imei/settings" element={<DeviceSettings />} />
          <Route path="device-settings" element={<DeviceSettings />} />
          <Route path="telemetry" element={<Telemetry />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="geofence" element={<Geofence />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
          
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

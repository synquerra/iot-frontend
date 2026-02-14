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
import Configuration from "./pages/Configuration";
import DeviceSettings from "./pages/DeviceSettings";
import EmergencyContacts from "./pages/commands/EmergencyContacts";
import StopSOS from "./pages/commands/StopSOS";
import QueryNormal from "./pages/commands/QueryNormal";
import QueryDeviceSettings from "./pages/commands/QueryDeviceSettings";
import DeviceSettingsConfig from "./pages/commands/DeviceSettingsConfig";
import CallEnable from "./pages/commands/CallEnable";
import CallDisable from "./pages/commands/CallDisable";
import LEDOn from "./pages/commands/LEDOn";
import LEDOff from "./pages/commands/LEDOff";
import AmbientEnable from "./pages/commands/AmbientEnable";
import AmbientDisable from "./pages/commands/AmbientDisable";
import AmbientStop from "./pages/commands/AmbientStop";
import AirplaneEnable from "./pages/commands/AirplaneEnable";
import GPSDisable from "./pages/commands/GPSDisable";
import Geofence from "./pages/Geofence";

import DeviceDetails from "./pages/DeviceDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          <Route path="commands/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="commands/stop-sos" element={<StopSOS />} />
          <Route path="commands/query-normal" element={<QueryNormal />} />
          <Route path="commands/query-device-settings" element={<QueryDeviceSettings />} />
          <Route path="commands/device-settings-config" element={<DeviceSettingsConfig />} />
          <Route path="commands/call-enable" element={<CallEnable />} />
          <Route path="commands/call-disable" element={<CallDisable />} />
          <Route path="commands/led-on" element={<LEDOn />} />
          <Route path="commands/led-off" element={<LEDOff />} />
          <Route path="commands/ambient-enable" element={<AmbientEnable />} />
          <Route path="commands/ambient-disable" element={<AmbientDisable />} />
          <Route path="commands/ambient-stop" element={<AmbientStop />} />
          <Route path="commands/airplane-enable" element={<AirplaneEnable />} />
          <Route path="commands/gps-disable" element={<GPSDisable />} />
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

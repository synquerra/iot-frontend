import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiActivity,
  FiSliders,
  FiTool,
  FiMapPin,
  FiCpu,
  FiBarChart2,
  FiBell,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { logoutUser } from "../utils/auth";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Overview", icon: <FiHome /> },
    { to: "/devices", label: "Devices", icon: <FiCpu /> },
    { to: "/telemetry", label: "Telemetry", icon: <FiActivity /> },
    { to: "/configuration", label: "Configuration", icon: <FiSliders /> },
    { to: "/device-settings", label: "Device Settings", icon: <FiTool /> },
    { to: "/geofence", label: "Geofence", icon: <FiMapPin /> },
    { to: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { to: "/alerts", label: "Alerts", icon: <FiBell /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> },
  ];

  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";

  return (
    <aside className="w-72 bg-card p-4 h-screen sticky top-0 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold">Synquerra</h1>
        <p className="text-sm text-slate-400">Device orchestration</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors ${
                isActive ? "bg-slate-800 text-white" : "text-slate-300"
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 pt-6 border-t border-slate-800 text-sm text-slate-400">
        <div className="mb-3">
          Logged in as <strong>{userEmail}</strong>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-transparent border-b border-slate-800">
      <div className="flex items-center gap-4">
        <button className="px-3 py-2 rounded-md bg-slate-800">Overview</button>
        <div className="text-slate-400">Welcome back — Admin</div>
      </div>
      <div className="flex items-center gap-4">
        <input
          placeholder="Search devices..."
          className="bg-slate-900 px-3 py-2 rounded-md outline-none text-sm"
        />
        <button className="px-3 py-2 rounded-md bg-gradient-to-r from-primary to-accent text-slate-900">
          Upgrade
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col bg-bg">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

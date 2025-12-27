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
    <aside className="w-72 bg-card border-r border-slate-800/50 p-6 h-screen sticky top-0 flex flex-col">
      {/* Enhanced header with better typography and spacing */}
      <div className="mb-10 px-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Synquerra</h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">Device orchestration</p>
      </div>

      {/* Enhanced navigation with improved styling */}
      <nav className="space-y-2 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-out relative ${
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-accent/10 text-white border border-primary/30 shadow-lg shadow-primary/10" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border hover:border-slate-700/50"
              }`
            }
          >
            {/* Active indicator */}
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                )}
                <span className={`text-lg transition-transform duration-200 ${
                  isActive ? "text-accent" : "group-hover:scale-110"
                }`}>
                  {l.icon}
                </span>
                <span className="transition-colors duration-200">{l.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Enhanced user section with better visual hierarchy */}
      <div className="mt-auto pt-6 border-t border-slate-800/60">
        <div className="px-3 mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Logged in as
          </div>
          <div className="text-sm text-slate-300 font-medium truncate">
            {userEmail}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
        >
          <FiLogOut className="text-base" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-transparent border-b border-slate-800/50 backdrop-blur-sm">
      {/* Left section with enhanced breadcrumb and welcome message */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm font-medium text-slate-200">
            Overview
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600"></div>
          <div className="text-slate-400 text-sm font-medium">Welcome back, Admin</div>
        </div>
      </div>
      
      {/* Right section with enhanced search and actions */}
      <div className="flex items-center gap-4">
        {/* Enhanced search input */}
        <div className="relative">
          <input
            placeholder="Search devices..."
            className="w-64 bg-slate-900/60 border border-slate-700/50 px-4 py-2.5 pl-10 rounded-lg outline-none text-sm text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-accent/50 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-accent/10 hover:border-slate-600/50"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Enhanced upgrade button */}
        <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-slate-900 font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 active:scale-95 border border-accent/20">
          Upgrade
        </button>
        
        {/* Additional action buttons for better UX */}
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-800/50">
          <button className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600/50 transition-all duration-200 hover:shadow-md">
            <FiBell className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600/50 transition-all duration-200 hover:shadow-md">
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
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

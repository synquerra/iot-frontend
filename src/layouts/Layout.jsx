import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
import { useUserContext } from "../contexts/UserContext";
import { spectrumColors, gradients } from "../design-system/tokens/colors";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearUserContext } = useUserContext();

  const handleLogout = () => {
    // Clear UserContext state
    clearUserContext();
    // Clear persistent storage and tokens
    logoutUser();
    navigate("/login");
  };

  // Enhanced navigation links with color coding and icons
  const links = [
    { to: "/", label: "Overview", icon: <FiHome />, colorScheme: "violet", description: "Dashboard overview" },
    { to: "/devices", label: "Devices", icon: <FiCpu />, colorScheme: "blue", description: "Device management" },
    { to: "/telemetry", label: "Telemetry", icon: <FiActivity />, colorScheme: "cyan", description: "Real-time data" },
    // { to: "/configuration", label: "Configuration", icon: <FiSliders />, colorScheme: "teal", description: "System settings" },
    { to: "/device-settings", label: "Device Settings", icon: <FiTool />, colorScheme: "green", description: "Device configuration" },
    { to: "/geofence", label: "Geofence", icon: <FiMapPin />, colorScheme: "lime", description: "Location boundaries" },
    //{ to: "/analytics", label: "Analytics", icon: <FiBarChart2 />, colorScheme: "amber", description: "Data insights" },
    { to: "/alerts", label: "Alerts", icon: <FiBell />, colorScheme: "orange", description: "System notifications" },
    { to: "/settings", label: "Settings", icon: <FiSettings />, colorScheme: "pink", description: "User preferences" },
  ];

  // Logout action item (separate from navigation links)
  const logoutAction = {
    label: "Logout",
    icon: <FiLogOut />,
    colorScheme: "red",
    description: "Sign out of account",
    onClick: handleLogout
  };

  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";

  return (
    <aside className="w-72 bg-gradient-to-b from-card via-card to-surface-secondary border-r border-slate-800/50 p-6 h-screen sticky top-0 flex flex-col relative overflow-hidden">
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-teal-900/10 pointer-events-none" />
      
      {/* Enhanced header with gradient accent */}
      <div className="mb-10 px-1 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Synquerra</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1 font-medium ml-11">Device orchestration platform</p>
        
        {/* Colorful divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      </div>

      {/* Enhanced navigation with color-coded active states */}
      <nav className="space-y-2 flex-1 relative z-10">
        {links.map((link) => {
          const isActive = location.pathname === link.to || 
            (link.to !== "/" && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={`group flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-out relative overflow-hidden ${
                isActive 
                  ? `bg-gradient-to-r from-${link.colorScheme}-500/20 via-${link.colorScheme}-400/10 to-transparent text-white border border-${link.colorScheme}-500/30 shadow-lg shadow-${link.colorScheme}-500/10` 
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border hover:border-slate-700/50"
              }`}
            >
              {/* Active indicator with color coding */}
              {isActive && (
                <>
                  <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-${link.colorScheme}-400 to-${link.colorScheme}-600 rounded-r-full`} 
                  />
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r from-${link.colorScheme}-500/5 to-transparent rounded-lg`} 
                  />
                </>
              )}
              
              {/* Icon with color-coded active state */}
              <span 
                className={`text-lg transition-all duration-300 ${
                  isActive 
                    ? `text-${link.colorScheme}-400 drop-shadow-sm` 
                    : "group-hover:scale-110 group-hover:text-slate-200"
                }`}
              >
                {link.icon}
              </span>
              
              {/* Label and description */}
              <div className="flex flex-col">
                <span className="transition-colors duration-200">{link.label}</span>
                {isActive && (
                  <span className="text-xs text-slate-400 mt-0.5 opacity-80">
                    {link.description}
                  </span>
                )}
              </div>
              
              {/* Hover glow effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-600/5 to-slate-700/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </NavLink>
          );
        })}

        {/* Logout button styled as menu item */}
        <button
          onClick={logoutAction.onClick}
          className="group flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-out relative overflow-hidden text-slate-300 hover:text-white hover:bg-red-900/20 hover:border hover:border-red-500/30 w-full"
        >
          {/* Icon */}
          <span className="text-lg transition-all duration-300 group-hover:scale-110 group-hover:text-red-400">
            {logoutAction.icon}
          </span>
          
          {/* Label */}
          <div className="flex flex-col">
            <span className="transition-colors duration-200">{logoutAction.label}</span>
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700/0 via-red-600/5 to-red-700/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </nav>

      {/* Enhanced user section with just user info */}
      <div className="mt-auto pt-6 border-t border-slate-800/60 relative z-10">
        <div className="px-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-700/30">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Logged in as
          </div>
          <div className="text-sm text-slate-300 font-medium truncate">
            {userEmail}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const location = useLocation();
  
  // Get page title and description based on current route
  const getPageInfo = (pathname) => {
    const routes = {
      '/': { title: 'Overview', description: 'Dashboard overview and system status', color: 'violet' },
      '/devices': { title: 'Devices', description: 'Device management and monitoring', color: 'blue' },
      '/telemetry': { title: 'Telemetry', description: 'Real-time device data streams', color: 'cyan' },
      '/configuration': { title: 'Configuration', description: 'System configuration settings', color: 'teal' },
      '/device-settings': { title: 'Device Settings', description: 'Individual device configuration', color: 'green' },
      '/geofence': { title: 'Geofence', description: 'Location boundary management', color: 'lime' },
      '/analytics': { title: 'Analytics', description: 'Data insights and reporting', color: 'amber' },
      '/alerts': { title: 'Alerts', description: 'System notifications and alerts', color: 'orange' },
      '/settings': { title: 'Settings', description: 'User preferences and account', color: 'pink' },
    };
    
    // Handle dynamic routes like /devices/:imei
    for (const [route, info] of Object.entries(routes)) {
      if (pathname === route || (route !== '/' && pathname.startsWith(route))) {
        return info;
      }
    }
    
    return { title: 'Synquerra', description: 'Device orchestration platform', color: 'violet' };
  };

  const pageInfo = getPageInfo(location.pathname);
  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";

  return (
    <div className="relative">
      {/* Gradient header background */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-surface-primary to-bg" />
      <div className={`absolute inset-0 bg-gradient-to-r from-${pageInfo.color}-900/5 via-transparent to-${pageInfo.color}-900/5`} />
      
      <div className="relative flex items-center justify-between px-6 py-4 border-b border-slate-800/50 backdrop-blur-sm">
        {/* Left section with enhanced breadcrumb and page info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Page indicator with color coding */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-${pageInfo.color}-500/10 to-${pageInfo.color}-400/5 border border-${pageInfo.color}-500/20`}>
              <div className={`w-2 h-2 rounded-full bg-${pageInfo.color}-400 animate-pulse`} />
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-white">
                  {pageInfo.title}
                </div>
                <div className="text-xs text-slate-400">
                  {pageInfo.description}
                </div>
              </div>
            </div>
            
            {/* Welcome message with user info */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-slate-600"></div>
              <div className="flex flex-col">
                <div className="text-sm font-medium text-slate-300">
                  Welcome back
                </div>
                <div className="text-xs text-slate-500">
                  {userEmail.split('@')[0]}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right section with enhanced search and actions */}
        <div className="flex items-center gap-4">
          {/* Enhanced search input with gradient focus */}
          <div className="relative group">
            <input
              placeholder="Search devices..."
              className="w-64 bg-slate-900/60 border border-slate-700/50 px-4 py-2.5 pl-10 rounded-lg outline-none text-sm text-slate-200 placeholder-slate-500 transition-all duration-300 focus:border-teal-400/50 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-teal-400/10 hover:border-slate-600/50 group-focus-within:ring-2 group-focus-within:ring-teal-400/20"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Search input glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-400/0 via-teal-400/5 to-teal-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          
          {/* Enhanced upgrade button with gradient */}
          <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 active:scale-95 border border-violet-400/20">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade
            </span>
          </button>
          
          {/* Action buttons with color-coded hover states */}
          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-800/50">
            <button className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-orange-400 hover:bg-slate-800 hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300 group">
              <FiBell className="w-4 h-4 group-hover:animate-pulse" />
            </button>
            <button className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-pink-400 hover:bg-slate-800 hover:border-pink-500/30 hover:shadow-md hover:shadow-pink-500/10 transition-all duration-300">
              <FiSettings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-bg via-bg to-surface-primary">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col relative">
        {/* Background gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/5 via-transparent to-teal-900/5 pointer-events-none" />
        
        <Topbar />
        
        {/* Main content area with subtle background variations */}
        <main className="p-6 flex-1 relative z-10">
          {/* Content background with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-transparent pointer-events-none rounded-lg" />
          
          {/* Content wrapper */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
        
        {/* Footer section divider */}
        <div className="px-6 pb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

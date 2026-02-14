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
  FiList,
  FiUsers,
  FiAlertOctagon,
  FiCheckCircle,
  FiInfo,
  FiPhone,
  FiPhoneOff,
  FiZap,
  FiZapOff,
  FiVolume2,
  FiVolumeX,
  FiPower,
  FiAirplay,
  FiNavigation,
} from "react-icons/fi";
import { logoutUser } from "../utils/auth";
import { useUserContext } from "../contexts/UserContext";
import { spectrumColors, gradients } from "../design-system/tokens/colors";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearUserContext, isAdmin } = useUserContext();
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const handleLogout = () => {
    // Clear UserContext state
    clearUserContext();
    // Clear persistent storage and tokens
    logoutUser();
    navigate("/login");
  };

  // Toggle submenu expansion
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Enhanced navigation links with color coding, icons, and submenus
  const links = [
    { 
      to: "/", 
      label: "Overview", 
      icon: <FiHome />, 
      colorScheme: "violet", 
      description: "Dashboard overview" 
    },
    { 
      key: "devices",
      label: "Devices", 
      icon: <FiCpu />, 
      colorScheme: "blue", 
      description: "Device management",
      submenu: [
        { to: "/devices", label: "Device List", icon: <FiList />, description: "View all devices" },
        { 
          key: "device-settings-submenu",
          label: "Device's Settings",
          icon: <FiSettings />,
          submenu: [
            { to: "/commands/emergency-contacts", label: "Emergency Contacts", icon: <FiUsers /> },
            { to: "/commands/stop-sos", label: "Stop SOS Mode", icon: <FiAlertOctagon /> },
            { to: "/commands/query-normal", label: "Query Normal Status", icon: <FiCheckCircle /> },
            { to: "/commands/query-device-settings", label: "Query Device Settings", icon: <FiInfo /> },
            { to: "/commands/device-settings-config", label: "Device Settings", icon: <FiSliders /> },
            { to: "/commands/call-enable", label: "Enable Call", icon: <FiPhone /> },
            { to: "/commands/call-disable", label: "Disable Call", icon: <FiPhoneOff /> },
            { to: "/commands/led-on", label: "Turn LED On", icon: <FiZap /> },
            { to: "/commands/led-off", label: "Turn LED Off", icon: <FiZapOff /> },
            { to: "/commands/ambient-enable", label: "Enable Ambient Mode", icon: <FiVolume2 /> },
            { to: "/commands/ambient-disable", label: "Disable Ambient Mode", icon: <FiVolumeX /> },
            { to: "/commands/ambient-stop", label: "Stop Ambient Mode", icon: <FiPower /> },
            { to: "/commands/airplane-enable", label: "Enable Airplane Mode", icon: <FiAirplay /> },
            { to: "/commands/gps-disable", label: "Disable GPS", icon: <FiNavigation /> }
          ]
        }
      ]
    },
    ...(isAdmin() ? [{ 
      to: "/device-settings", 
      label: "Device Command", 
      icon: <FiSliders />, 
      colorScheme: "green", 
      description: "Send commands to devices" 
    }] : []),
    { 
      to: "/geofence", 
      label: "Geofence", 
      icon: <FiMapPin />, 
      colorScheme: "lime", 
      description: "Location boundaries" 
    },
    { 
      to: "/alerts", 
      label: "Alerts", 
      icon: <FiBell />, 
      colorScheme: "orange", 
      description: "System notifications" 
    },
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

  // Auto-expand/collapse menu based on current route
  React.useEffect(() => {
    const newExpandedMenus = {};
    
    links.forEach(link => {
      if (link.submenu) {
        // Check if any submenu item is active
        const hasActiveSubmenu = link.submenu.some(sub => {
          // Check direct submenu item
          if (sub.to && (location.pathname === sub.to || location.pathname.startsWith(sub.to))) {
            return true;
          }
          // Check nested submenu items
          if (sub.submenu) {
            return sub.submenu.some(nested => 
              nested.to && (location.pathname === nested.to || location.pathname.startsWith(nested.to))
            );
          }
          return false;
        });
        
        // Expand parent menu if submenu is active
        if (hasActiveSubmenu) {
          newExpandedMenus[link.key] = true;
          
          // Also expand nested submenu if needed
          link.submenu.forEach(sub => {
            if (sub.submenu) {
              const hasActiveNestedSubmenu = sub.submenu.some(nested =>
                nested.to && (location.pathname === nested.to || location.pathname.startsWith(nested.to))
              );
              if (hasActiveNestedSubmenu) {
                newExpandedMenus[sub.key] = true;
              }
            }
          });
        }
      }
    });
    
    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-gradient-to-b from-[#2c3e50] via-[#34495e] to-[#2c3e50] h-screen sticky top-0 flex flex-col shadow-2xl">
      {/* Header with logo */}
      <div className="p-4 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="transform transition-all duration-300 group-hover:translate-x-1">
            <h1 className="text-base font-bold text-white">Synquerra</h1>
            <p className="text-xs text-gray-300">IoT Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-3 py-3 border-b border-white/10 bg-black/10">
        <div className="flex items-center gap-2 text-xs text-gray-200 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-500/50"></div>
          <span className="truncate transition-colors duration-200 group-hover:text-white">{userEmail}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
        {links.map((link) => {
          // Handle items with submenus
          if (link.submenu) {
            const isExpanded = expandedMenus[link.key];
            const hasActiveSubmenu = link.submenu.some(sub => 
              location.pathname === sub.to || location.pathname.startsWith(sub.to)
            );
            
            return (
              <div key={link.key}>
                {/* Parent menu item */}
                <button
                  onClick={() => toggleMenu(link.key)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-300 group relative overflow-hidden ${
                    hasActiveSubmenu
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`text-base transform transition-all duration-300 ${hasActiveSubmenu ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`}>
                      {link.icon}
                    </div>
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-all duration-300 relative z-10 ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Submenu items */}
                {isExpanded && (
                  <div className="bg-black/20 backdrop-blur-sm animate-slideDown">
                    {link.submenu.map((subItem, subIndex) => {
                      // Handle nested submenu (Device's Settings)
                      if (subItem.submenu) {
                        const isNestedExpanded = expandedMenus[subItem.key];
                        
                        return (
                          <div key={subItem.key}>
                            {/* Nested submenu parent */}
                            <button
                              onClick={() => toggleMenu(subItem.key)}
                              className="w-full flex items-center justify-between pl-12 pr-4 py-2 text-sm transition-all duration-300 text-gray-300 hover:bg-white/10 hover:text-white group relative"
                            >
                              <div className="flex items-center gap-3 relative z-10">
                                {subItem.icon && <div className="text-sm transform transition-all duration-300 group-hover:scale-110">{subItem.icon}</div>}
                                <span>{subItem.label}</span>
                              </div>
                              <svg 
                                className={`w-3 h-3 transition-all duration-300 relative z-10 ${isNestedExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {/* Nested submenu items */}
                            {isNestedExpanded && (
                              <div className="bg-black/30 backdrop-blur-sm animate-slideDown">
                                {subItem.submenu.map((nestedItem, nestedIndex) => {
                                  // If nested item has 'to' property, make it navigable
                                  if (nestedItem.to) {
                                    const isNestedActive = location.pathname === nestedItem.to;
                                    
                                    return (
                                      <NavLink
                                        key={nestedIndex}
                                        to={nestedItem.to}
                                        className={`flex items-center gap-2 pl-20 pr-4 py-2 text-xs transition-all duration-300 group relative ${
                                          isNestedActive
                                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border-l-4 border-blue-300"
                                            : "text-gray-400 hover:bg-white/10 hover:text-white hover:pl-[82px]"
                                        }`}
                                      >
                                        {nestedItem.icon && <div className={`text-xs transform transition-all duration-300 ${isNestedActive ? 'scale-110' : 'group-hover:scale-110'}`}>{nestedItem.icon}</div>}
                                        <span>{nestedItem.label}</span>
                                        {isNestedActive && (
                                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                        )}
                                      </NavLink>
                                    );
                                  }
                                  
                                  // Non-navigable item (coming soon)
                                  return (
                                    <div
                                      key={nestedIndex}
                                      className="flex items-center gap-2 pl-20 pr-4 py-2 text-xs text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors cursor-default"
                                    >
                                      <span className="text-xs">◦</span>
                                      <span>{nestedItem.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      // Regular submenu item with navigation
                      const isActive = location.pathname === subItem.to || 
                        (subItem.to !== "/" && location.pathname.startsWith(subItem.to));
                      
                      return (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          className={`flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-all duration-300 group relative ${
                            isActive 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border-l-4 border-blue-300" 
                              : "text-gray-300 hover:bg-white/10 hover:text-white hover:pl-[50px]"
                          }`}
                        >
                          {subItem.icon && <div className={`text-sm transform transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{subItem.icon}</div>}
                          <span>{subItem.label}</span>
                          {isActive && (
                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          // Handle regular menu items (no submenu)
          const isActive = location.pathname === link.to || 
            (link.to !== "/" && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg" 
                  : "text-gray-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className={`text-base relative z-10 transform transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`}>
                {link.icon}
              </div>
              <span className="font-medium relative z-10">{link.label}</span>
              {isActive && (
                <div className="absolute right-4 w-2 h-2 rounded-full bg-white animate-pulse shadow-lg shadow-white/50"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer with version info */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            Online
          </span>
          <span className="opacity-60">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUserContext } = useUserContext();
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  
  const handleLogout = () => {
    // Clear UserContext state
    clearUserContext();
    // Clear persistent storage and tokens
    logoutUser();
    navigate("/login");
  };
  
  // Get user info from localStorage
  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
  
  // Get page title and description based on current route
  const getPageInfo = (pathname) => {
    const routes = {
      '/': { title: 'Dashboard', description: 'Dashboard overview and system status', color: 'violet' },
      '/devices': { title: 'Devices', description: 'Device management and monitoring', color: 'blue' },
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
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section - Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{pageInfo.description}</p>
        </div>
        
        {/* Right section - User actions */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
            title="Notifications"
          >
            <FiBell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative profile-dropdown-container">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="User Profile"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiSettings className="w-4 h-4 text-gray-500" />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Topbar />
        
        {/* Main content area */}
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

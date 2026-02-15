// src/pages/Devices.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../design-system/components";
import { listDevicesFiltered } from "../utils/deviceFiltered";
import { getAnalyticsByImei } from "../utils/analytics";
import { parseTemperature } from "../utils/telemetryTransformers";
import { cn } from "../design-system/utils/cn";
import { useDeviceFilter } from "../hooks/useDeviceFilter";
import { useUserContext } from "../contexts/UserContext";
import { getDeviceDisplayName, maskImei, getDeviceDisplayNameWithMaskedImei } from "../utils/deviceDisplay";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  
  // User context for role-based logic
  const { isAdmin } = useUserContext();
  
  // Use device filter hook for user-based filtering
  const { filterDevices, shouldFilterDevices } = useDeviceFilter();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { devices: items } = await listDevicesFiltered();
        
        // Apply user-based device filtering (PARENTS vs ADMIN)
        const filteredItems = filterDevices(items);

        // For each device, fetch the latest normal packet to get battery and signal data
        const devicesWithTelemetry = await Promise.all(
          filteredItems.map(async (device) => {
            try {
              // Get all packets for this device
              const packets = await getAnalyticsByImei(device.imei);
              
              // Filter for normal packets and get the latest one
              const normalPackets = packets.filter(
                (p) => p.packet === "N" || p.packetType === "N" || p.type === "N"
              );
              const latestNormal = normalPackets[0] || null;

              // Extract battery, signal, and temperature values with validation
              let batteryLevel = null;
              let signalStrength = null;
              let temperature = null;

              if (latestNormal) {
                // Parse battery value
                if (latestNormal.battery !== null && latestNormal.battery !== undefined) {
                  const batteryNum = Number(latestNormal.battery);
                  if (!isNaN(batteryNum) && batteryNum >= 0 && batteryNum <= 100) {
                    batteryLevel = Math.round(batteryNum);
                  }
                }

                // Parse signal value
                if (latestNormal.signal !== null && latestNormal.signal !== undefined) {
                  const signalNum = Number(latestNormal.signal);
                  if (!isNaN(signalNum) && signalNum >= 0 && signalNum <= 100) {
                    signalStrength = Math.round(signalNum);
                  }
                }

                // Parse temperature value using centralized function
                if (latestNormal.rawTemperature !== null && latestNormal.rawTemperature !== undefined) {
                  console.log('[Devices.jsx] Raw temperature from API:', latestNormal.rawTemperature);
                  const tempNum = parseTemperature(latestNormal.rawTemperature);
                  console.log('[Devices.jsx] Parsed temperature:', tempNum);
                  if (tempNum !== 0 || latestNormal.rawTemperature === 0 || latestNormal.rawTemperature === "0") {
                    temperature = Math.round(tempNum * 10) / 10; // Round to 1 decimal place
                    console.log('[Devices.jsx] Final temperature:', temperature);
                  }
                } else {
                  console.log('[Devices.jsx] rawTemperature is null or undefined');
                }
              }

              // Analyze packets for device conditions
              const latestPacket = packets[0] || null;
              const now = Date.now();
              const lastPacketTime = latestPacket ? new Date(latestPacket.deviceTimestamp || latestPacket.timestamp).getTime() : 0;
              const timeSinceLastPacket = now - lastPacketTime;
              
              // Check for various conditions
              const isHanged = timeSinceLastPacket > 3600000; // No packet for 1 hour = hanged
              const hasSOS = packets.some(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'A1002' || alert === 'SOS';
              });
              const hasOverspeed = packets.some(p => Number(p.speed) > 70);
              const hasHighTemp = temperature !== null && temperature > 50;
              const hasLowBattery = batteryLevel !== null && batteryLevel < 20;
              
              // Check for error codes in alert/error packets
              const hasTampered = packets.some(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'A1003' || alert === 'TAMPERED';
              });
              const hasSimIssue = packets.some(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1011' || alert === 'NO_SIM' || alert === 'NO SIM';
              });
              const hasDataIssue = packets.some(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1003' || alert === 'NO_DATA_CAPABILITY' || alert === 'NO DATA CAPABILITY';
              });
              const hasGpsIssue = packets.some(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1001' || alert === 'GNSS_ERROR' || alert === 'GNSS CONNECTIVITY' || alert === 'A1004' || alert === 'GPS_DISABLED' || alert === 'GPS DISABLE';
              });

              return {
                topic: device.topic || "-",
                imei: device.imei || "-",
                studentName: device.studentName || null,
                studentId: device.studentId || null,
                temperature: temperature,
                geoid: device.geoid || "-",
                createdAt: device.createdAt || "-",
                status: device.interval !== "-" ? "active" : "inactive",
                lastSeen: device.createdAt || "-",
                batteryLevel,
                signalStrength,
                // Device condition flags
                isHanged,
                hasSOS,
                hasOverspeed,
                hasHighTemp,
                hasLowBattery,
                hasTampered,
                hasSimIssue,
                hasDataIssue,
                hasGpsIssue,
              };
            } catch (err) {
              console.warn(`Failed to fetch telemetry for device ${device.imei}:`, err.message);
              // Return device with null values if telemetry fetch fails
              return {
                topic: device.topic || "-",
                imei: device.imei || "-",
                studentName: device.studentName || null,
                studentId: device.studentId || null,
                temperature: null,
                geoid: device.geoid || "-",
                createdAt: device.createdAt || "-",
                status: device.interval !== "-" ? "active" : "inactive",
                lastSeen: device.createdAt || "-",
                batteryLevel: null,
                signalStrength: null,
                isHanged: false,
                hasSOS: false,
                hasOverspeed: false,
                hasHighTemp: false,
                hasLowBattery: false,
                hasTampered: false,
                hasSimIssue: false,
                hasDataIssue: false,
                hasGpsIssue: false,
              };
            }
          })
        );

        setDevices(devicesWithTelemetry);
      } catch (err) {
        setError(err.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    }

    load();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [filterDevices]);

  // Filter devices based on search and status
  const filteredDevices = devices.filter(device => {
    const displayName = getDeviceDisplayNameWithMaskedImei(device);
    const matchesSearch = device.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Determine if search & filters should be shown
  // Show if: ADMIN (always) OR Parent with 2+ devices
  const shouldShowSearchFilters = useMemo(() => {
    if (isAdmin()) {
      return true; // Always show for ADMIN
    }
    // For PARENTS, only show if they have 2 or more devices
    return devices.length >= 2;
  }, [isAdmin, devices.length]);

  const stats = {
    // Row 1
    total: devices.length,
    active: devices.filter(d => d.status === "active").length,
    inactive: devices.filter(d => d.status === "inactive").length,
    hanged: devices.filter(d => d.isHanged).length,
    tampered: devices.filter(d => d.hasTampered).length,
    
    // Row 2
    highTemp: devices.filter(d => d.hasHighTemp).length,
    sos: devices.filter(d => d.hasSOS).length,
    overspeed: devices.filter(d => d.hasOverspeed).length,
    anomaly: devices.filter(d => d.isHanged || d.hasTampered).length, // Anomaly = hanged or tampered
    restrictedEntry: 0, // Requires geofence breach detection - not implemented yet
    
    // Row 3
    simNotWorking: devices.filter(d => d.hasSimIssue).length,
    lowData: devices.filter(d => d.hasDataIssue).length,
    gpsUplinkIssues: devices.filter(d => d.hasGpsIssue).length,
    batteryHealth: devices.filter(d => d.hasLowBattery).length,
    ble: 0, // BLE status not available in current data
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          type="spinner" 
          size="xl" 
          color="blue"
          text="Loading devices..." 
          textPosition="bottom"
        />
      </div>
    );
  }

  if (error && devices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fas fa-exclamation-circle text-3xl text-[#dc3545]"></i>
          </div>
          <div className="text-[#dc3545] text-lg font-semibold mb-2">
            Failed to Load Devices
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* AdminLTE v3 Header */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              <i className="fas fa-microchip mr-2 text-[#007bff]"></i>
              Device Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Monitor and manage your connected IoT devices</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {shouldFilterDevices() && (
              <span 
                className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded text-blue-700 text-xs font-medium"
                title="You are viewing only devices assigned to your account"
              >
                <i className="fas fa-filter mr-1"></i>
                Filtered View
              </span>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#17a2b8] hover:bg-[#138496] text-white rounded transition-colors text-sm font-medium"
            >
              <i className="fas fa-redo mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => navigate('/devices/add')}
              className="px-4 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white rounded transition-colors text-sm font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Device
            </button>
          </div>
        </div>
      </div>

      {/* AdminLTE v3 Small Boxes - Row 1: Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Devices */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm font-medium mt-1">Total Devices</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-microchip text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            All registered
          </div>
        </div>

        {/* Active */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#28a745] to-[#218838] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.active}</div>
            <div className="text-sm font-medium mt-1">Active</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-check-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Online now
          </div>
        </div>

        {/* Inactive */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.inactive}</div>
            <div className="text-sm font-medium mt-1">Inactive</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation-triangle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Offline
          </div>
        </div>

        {/* Hanged */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.hanged}</div>
            <div className="text-sm font-medium mt-1">Hanged</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-times-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Not responding
          </div>
        </div>

        {/* Tampered */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6f42c1] to-[#5a32a3] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.tampered}</div>
            <div className="text-sm font-medium mt-1">Tampered</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-shield-alt text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Security alert
          </div>
        </div>
      </div>

      {/* Row 2 - Alerts & Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* High Temp */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.highTemp}</div>
            <div className="text-sm font-medium mt-1">High Temp</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-thermometer-full text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            &gt;50°C
          </div>
        </div>

        {/* SOS */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#fd7e14] to-[#e8590c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.sos}</div>
            <div className="text-sm font-medium mt-1">SOS</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Emergency
          </div>
        </div>

        {/* Overspeed */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.overspeed}</div>
            <div className="text-sm font-medium mt-1">Overspeed</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-tachometer-alt text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            &gt;70 km/h
          </div>
        </div>

        {/* Anomaly */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#e83e8c] to-[#d63384] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.anomaly}</div>
            <div className="text-sm font-medium mt-1">Anomaly</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Unusual behavior
          </div>
        </div>

        {/* Restricted Entry */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6610f2] to-[#520dc2] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.restrictedEntry}</div>
            <div className="text-sm font-medium mt-1">Restricted Entry</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-ban text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Geofence breach
          </div>
        </div>
      </div>

      {/* Row 3 - Technical Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* SIM Not Working */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.simNotWorking}</div>
            <div className="text-sm font-medium mt-1">SIM Not Working</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-sim-card text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            No SIM
          </div>
        </div>

        {/* Low Data */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.lowData}</div>
            <div className="text-sm font-medium mt-1">Low Data</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-database text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Data issue
          </div>
        </div>

        {/* GPS Uplink Issues */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#fd7e14] to-[#e8590c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.gpsUplinkIssues}</div>
            <div className="text-sm font-medium mt-1">GPS Issues</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-satellite-dish text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            GNSS error
          </div>
        </div>

        {/* Battery Health */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6f42c1] to-[#5a32a3] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.batteryHealth}</div>
            <div className="text-sm font-medium mt-1">Battery Health</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-battery-quarter text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Low battery
          </div>
        </div>

        {/* BLE */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.ble}</div>
            <div className="text-sm font-medium mt-1">BLE</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-bluetooth text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Bluetooth
          </div>
        </div>
      </div>

      {/* Search and Filters - AdminLTE Style - Only show for ADMIN or Parent with 2+ devices */}
      {shouldShowSearchFilters && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">
                <i className="fas fa-search mr-2 text-[#007bff]"></i>
                Search & Filters
              </h3>
              <span className="px-2.5 py-0.5 bg-[#17a2b8] text-white text-xs font-semibold rounded">
                {filteredDevices.length} devices
              </span>
            </div>
            
            {shouldFilterDevices() && (
              <span 
                className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded text-blue-700 text-xs font-medium"
                title="You are viewing only devices assigned to your account"
              >
                <i className="fas fa-filter mr-1"></i>
                Filtered View
              </span>
            )}
          </div>
          
          <div className="p-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search devices by IMEI or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] min-w-[160px] bg-white"
                style={{ backgroundColor: 'white', color: '#111827' }}
              >
                <option value="all" style={{ backgroundColor: 'white', color: '#111827' }}>All Devices</option>
                <option value="active" style={{ backgroundColor: 'white', color: '#111827' }}>Active Only</option>
                <option value="inactive" style={{ backgroundColor: 'white', color: '#111827' }}>Inactive Only</option>
              </select>
              
              {/* Clear Filters */}
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="fas fa-times mr-1"></i>
                  Clear
                </button>
              )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  Showing {filteredDevices.length} of {devices.length} devices
                </span>
                <div className="flex items-center gap-1.5 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Auto-refresh enabled</span>
                </div>
              </div>
            </div>
            
            {/* Filtering Info Box for PARENTS users */}
            {shouldFilterDevices() && (
              <div className="mt-3 p-3 bg-blue-50 border-l-4 border-[#007bff] rounded">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-[#007bff] mt-0.5"></i>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium text-sm mb-1">
                      Viewing Assigned Devices Only
                    </div>
                    <div className="text-gray-600 text-xs leading-relaxed">
                      You are viewing {devices.length} device{devices.length !== 1 ? 's' : ''} assigned to your account. 
                      Contact your administrator to modify device assignments or view additional devices.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device Display - Table View - AdminLTE Style */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">
            <i className="fas fa-table mr-2 text-[#007bff]"></i>
            Device List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Battery</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Temperature</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <Loading type="spinner" size="md" />
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500 text-sm">
                    {searchTerm || filterStatus !== 'all' 
                      ? "No devices match your filters" 
                      : "No devices found"}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device, idx) => (
                  <tr 
                    key={device.imei || idx} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/devices/${device.imei}`)}
                  >
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded text-white',
                        device.status === 'active' ? 'bg-[#28a745]' : 'bg-[#ffc107]'
                      )}>
                        <i className={cn(
                          'fas',
                          device.status === 'active' ? 'fa-check-circle' : 'fa-exclamation-triangle'
                        )}></i>
                        {device.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    {/* Device Name / IMEI */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-sm text-gray-900">
                        {getDeviceDisplayNameWithMaskedImei(device)}
                      </span>
                    </td>
                    
                    {/* Battery */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {device.batteryLevel !== null ? (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full',
                                  device.batteryLevel > 60 ? 'bg-[#28a745]' :
                                  device.batteryLevel > 30 ? 'bg-[#ffc107]' : 'bg-[#dc3545]'
                                )}
                                style={{ width: `${device.batteryLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700">{device.batteryLevel}%</span>
                          </>
                        ) : (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gray-400 w-full opacity-50"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400">N/A</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    {/* Signal */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {device.signalStrength !== null ? (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full',
                                  device.signalStrength > 70 ? 'bg-[#28a745]' :
                                  device.signalStrength > 40 ? 'bg-[#ffc107]' : 'bg-[#dc3545]'
                                )}
                                style={{ width: `${device.signalStrength}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700">{device.signalStrength}%</span>
                          </>
                        ) : (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gray-400 w-full opacity-50"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400">N/A</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    {/* Temperature */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-medium',
                        device.temperature !== null ? (
                          device.temperature > 50 ? 'text-[#dc3545]' :
                          device.temperature > 30 ? 'text-[#ffc107]' : 'text-[#28a745]'
                        ) : 'text-gray-400'
                      )}>
                        {device.temperature !== null ? `${device.temperature}°C` : 'N/A'}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/devices/${device.imei}`);
                          }}
                          className="px-3 py-1 bg-[#17a2b8] hover:bg-[#138496] text-white rounded text-xs font-medium transition-colors"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/devices/${device.imei}/settings`);
                          }}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
                        >
                          <i className="fas fa-cog mr-1"></i>
                          Settings
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State - AdminLTE Style */}
      {filteredDevices.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fas fa-microchip text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No devices found' : 'No devices registered'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters to find devices.'
              : 'Get started by adding your first IoT device to the system.'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => navigate('/devices/add')}
              className="px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Device
            </button>
          )}
        </div>
      )}
    </div>
  );
}

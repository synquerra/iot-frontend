// src/pages/Devices.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { EnhancedTable, EnhancedTableContainer, StatusBadge } from "../design-system/components/EnhancedTable";
import { listDevicesFiltered } from "../utils/deviceFiltered";
import { getAnalyticsByImei } from "../utils/analytics";
import { parseTemperature } from "../utils/telemetryTransformers";
import { cn } from "../design-system/utils/cn";
import { useDeviceFilter } from "../hooks/useDeviceFilter";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  
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
    const matchesSearch = device.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" colorScheme="red" padding="xl" className="max-w-md">
          <Card.Content className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-red-400 text-lg font-semibold mb-2">
              Failed to Load Devices
            </div>
            <div className="text-red-300 text-sm mb-4">
              {error}
            </div>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header with Modern Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20 border border-blue-500/30 backdrop-blur-xl">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Device Management
                </h1>
                {shouldFilterDevices() && (
                  <span 
                    className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-blue-200 text-xs font-medium cursor-help"
                    title="You are viewing only devices assigned to your account"
                  >
                    Filtered View
                  </span>
                )}
              </div>
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-2xl">
                Monitor, manage, and analyze your connected IoT devices with real-time insights and comprehensive analytics
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="glass"
                colorScheme="teal"
                size="lg"
                onClick={() => navigate('/devices/add')}
                className="backdrop-blur-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Device
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                size="lg"
                onClick={() => window.location.reload()}
                className="backdrop-blur-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-blue-200/80 text-sm font-medium mb-1">Total Devices</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.total}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-200/70 text-xs">All registered</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-green-200/80 text-sm font-medium mb-1">Active</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.active}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200/70 text-xs">Online</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-amber-200/80 text-sm font-medium mb-1">Inactive</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.inactive}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Offline</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="red" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-red-200/80 text-sm font-medium mb-1">Hanged</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.hanged}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-200/70 text-xs">Not responding</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-purple-200/80 text-sm font-medium mb-1">Tampered</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.tampered}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200/70 text-xs">Security alert</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Row 2 - Alerts & Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card variant="glass" colorScheme="red" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-red-200/80 text-sm font-medium mb-1">High Temp</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.highTemp}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-200/70 text-xs">&gt;50°C</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-amber-200/80 text-sm font-medium mb-1">SOS</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.sos}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Emergency</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="orange" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-orange-200/80 text-sm font-medium mb-1">Overspeed</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.overspeed}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-200/70 text-xs">&gt;70 km/h</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="pink" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-pink-200/80 text-sm font-medium mb-1">Anomaly</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.anomaly}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <span className="text-pink-200/70 text-xs">Unusual behavior</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="indigo" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-indigo-200/80 text-sm font-medium mb-1">Restricted Entry</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.restrictedEntry}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-indigo-200/70 text-xs">Geofence breach</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Row 3 - Technical Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card variant="glass" colorScheme="red" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-red-200/80 text-sm font-medium mb-1">SIM Not Working</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.simNotWorking}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-200/70 text-xs">No SIM</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-amber-200/80 text-sm font-medium mb-1">Low Data</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.lowData}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Data issue</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="orange" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-orange-200/80 text-sm font-medium mb-1">GPS Uplink Issues</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.gpsUplinkIssues}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-200/70 text-xs">GNSS error</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-purple-200/80 text-sm font-medium mb-1">Battery Health</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.batteryHealth}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200/70 text-xs">Low battery</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="2" y="7" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 10v4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="cyan" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-cyan-200/80 text-sm font-medium mb-1">BLE</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.ble}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200/70 text-xs">Bluetooth</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Enhanced Controls and Filters */}
      <Card variant="glass" colorScheme="slate" padding="lg" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search devices by IMEI or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl',
                    'bg-white/10 backdrop-blur-xl border border-white/20',
                    'text-white placeholder-white/60',
                    'focus:bg-white/15 focus:border-blue-400/60 focus:outline-none focus:ring-4 focus:ring-blue-400/20',
                    'transition-all duration-300'
                  )}
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={cn(
                  'px-4 py-3 rounded-xl min-w-[160px]',
                  'bg-white/10 backdrop-blur-xl border border-white/20',
                  'text-white',
                  'focus:bg-white/15 focus:border-blue-400/60 focus:outline-none',
                  'transition-all duration-300'
                )}
              >
                <option value="all" className="bg-slate-900 text-white">All Devices</option>
                <option value="active" className="bg-slate-900 text-white">Active Only</option>
                <option value="inactive" className="bg-slate-900 text-white">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-white/70">
                    Showing {filteredDevices.length} of {devices.length} devices
                  </span>
                  {shouldFilterDevices() && (
                    <div 
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg cursor-help"
                      title="Device filtering is active based on your account permissions"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span className="text-blue-300 text-xs font-medium">Filtered View Active</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70">Auto-refresh enabled</span>
                </div>
              </div>
              
              {/* Filtering Info Box for PARENTS users */}
              {shouldFilterDevices() && (
                <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-blue-200 font-medium text-sm mb-1">
                        Viewing Assigned Devices Only
                      </div>
                      <div className="text-blue-200/70 text-xs leading-relaxed">
                        You are viewing {devices.length} device{devices.length !== 1 ? 's' : ''} assigned to your account. 
                        Contact your administrator to modify device assignments or view additional devices.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Device Display - Table View */}
      <EnhancedTableContainer variant="enhanced" colorScheme="blue" padding="lg">
        <EnhancedTable
          variant="enhanced"
          size="md"
          colorScheme="blue"
          hoverable={true}
          striped={true}
          loading={loading}
          loadingRows={5}
          loadingColumns={7}
          data={filteredDevices}
          colorCoded={true}
          showBadges={true}
          responsive={true}
          columns={[
            {
              key: 'status',
              header: 'Status',
              sortable: true,
              render: (value) => (
                <StatusBadge 
                  type={value === 'active' ? 'success' : 'warning'} 
                  value={value === 'active' ? 'Active' : 'Inactive'}
                  size="sm"
                />
              )
            },
            {
              key: 'topic',
              header: 'Topic',
              sortable: true,
              render: (value) => (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0"></div>
                  <span className="font-semibold text-white break-all text-sm leading-tight max-w-[200px]">{value}</span>
                </div>
              )
            },
            {
              key: 'imei',
              header: 'IMEI',
              sortable: true,
              render: (value) => (
                <span className="font-mono text-xs text-slate-300 bg-slate-800/50 px-2 py-1.5 rounded break-all leading-relaxed max-w-[180px] block">
                  {value}
                </span>
              )
            },
            {
              key: 'batteryLevel',
              header: 'Battery',
              sortable: true,
              render: (value) => (
                <div className="flex items-center gap-2">
                  {value !== null ? (
                    <>
                      <div className="w-16 bg-white/20 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            value > 60 ? 'bg-green-400' :
                            value > 30 ? 'bg-amber-400' : 'bg-red-400'
                          )}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{value}%</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 bg-white/20 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gray-500 w-full opacity-50"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">N/A</span>
                    </>
                  )}
                </div>
              )
            },
            {
              key: 'signalStrength',
              header: 'Signal',
              sortable: true,
              render: (value) => (
                <div className="flex items-center gap-2">
                  {value !== null ? (
                    <>
                      <div className="w-16 bg-white/20 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            value > 70 ? 'bg-green-400' :
                            value > 40 ? 'bg-amber-400' : 'bg-red-400'
                          )}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{value}%</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 bg-white/20 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gray-500 w-full opacity-50"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">N/A</span>
                    </>
                  )}
                </div>
              )
            },
            {
              key: 'temperature',
              header: 'Temperature',
              sortable: true,
              render: (value) => (
                <span className={cn(
                  'text-sm font-medium',
                  value !== null ? (
                    value > 50 ? 'text-red-400' :
                    value > 30 ? 'text-amber-400' : 'text-green-400'
                  ) : 'text-slate-400'
                )}>
                  {value !== null ? `${value}°C` : 'N/A'}
                </span>
              )
            },
            {
              key: 'actions',
              header: 'Actions',
              sortable: false,
              render: (value, device) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="glass"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => navigate(`/devices/${device.imei}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/devices/${device.imei}/settings`)}
                    className="text-slate-400 hover:text-white"
                  >
                    Settings
                  </Button>
                </div>
              )
            }
          ]}
          emptyMessage="No devices found matching your criteria"
          onRowClick={(device) => navigate(`/devices/${device.imei}`)}
        />
      </EnhancedTableContainer>

      {/* Empty State */}
      {filteredDevices.length === 0 && !loading && (
        <Card variant="glass" colorScheme="slate" padding="xl" className="text-center">
          <Card.Content>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No devices found' : 'No devices registered'}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria or filters to find devices.'
                : 'Get started by adding your first IoT device to the system.'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Button
                variant="glass"
                colorScheme="blue"
                size="lg"
                onClick={() => navigate('/devices/add')}
              >
                Add Your First Device
              </Button>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

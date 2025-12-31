// src/pages/Devices.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { EnhancedTable, EnhancedTableContainer, StatusBadge } from "../design-system/components/EnhancedTable";
import { listDevices } from "../utils/device";
import { getAnalyticsByImei } from "../utils/analytics";
import { cn } from "../design-system/utils/cn";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { devices: items } = await listDevices();

        // For each device, fetch the latest normal packet to get battery and signal data
        const devicesWithTelemetry = await Promise.all(
          items.map(async (device) => {
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

                // Parse temperature value
                if (latestNormal.rawTemperature !== null && latestNormal.rawTemperature !== undefined) {
                  // Extract numeric value from temperature string (remove non-numeric characters except decimal point and minus)
                  const tempStr = String(latestNormal.rawTemperature).replace(/[^\d.-]/g, "");
                  const tempNum = Number(tempStr);
                  if (!isNaN(tempNum)) {
                    temperature = Math.round(tempNum * 10) / 10; // Round to 1 decimal place
                  }
                }
              }

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
  }, []);

  // Filter devices based on search and status
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: devices.length,
    active: devices.filter(d => d.status === "active").length,
    inactive: devices.filter(d => d.status === "inactive").length,
    online: devices.filter(d => d.status === "active").length, // Simplified for demo
    highTemp: devices.filter(d => d.temperature !== null && d.temperature > 50).length,
    normalTemp: devices.filter(d => d.temperature !== null && d.temperature <= 50).length,
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                Device Management
              </h1>
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

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="text-green-200/80 text-sm font-medium mb-1">Active Devices</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.active}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200/70 text-xs">Currently online</span>
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
                <div className="text-amber-200/80 text-sm font-medium mb-1">Inactive Devices</div>
                <div className="text-white text-3xl font-bold mb-2">{stats.inactive}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Need attention</span>
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
                <div className="text-red-200/80 text-sm font-medium mb-1">High Temperature</div>
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

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm font-medium">View:</span>
              <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-xl border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-blue-500/80 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    viewMode === 'table'
                      ? 'bg-blue-500/80 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">
                Showing {filteredDevices.length} of {devices.length} devices
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/70">Auto-refresh enabled</span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Device Display - Grid or Table View */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDevices.map((device) => (
            <Card 
              key={device.imei} 
              variant="glass" 
              colorScheme={device.status === 'active' ? 'green' : 'amber'} 
              padding="lg" 
              hover={true}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/devices/${device.imei}`)}
            >
              <Card.Content>
                <div className="space-y-4">
                  {/* Device Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          'w-3 h-3 rounded-full animate-pulse',
                          device.status === 'active' ? 'bg-green-400' : 'bg-amber-400'
                        )}></div>
                        <span className="text-white/90 text-sm font-medium">
                          {device.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2 break-all leading-tight">
                        {device.topic}
                      </h3>
                      <div className="text-white/70 text-xs font-mono bg-white/10 px-2 py-1.5 rounded break-all leading-relaxed">
                        <span className="text-white/50 text-xs block mb-1">IMEI:</span>
                        {device.imei}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  </div>

                  {/* Device Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs font-medium mb-1">Battery</div>
                      <div className="flex items-center gap-2">
                        {device.batteryLevel !== null ? (
                          <>
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full transition-all duration-300',
                                  device.batteryLevel > 60 ? 'bg-green-400' :
                                  device.batteryLevel > 30 ? 'bg-amber-400' : 'bg-red-400'
                                )}
                                style={{ width: `${device.batteryLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-xs font-bold">{device.batteryLevel}%</span>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gray-500 w-full opacity-50"></div>
                            </div>
                            <span className="text-white/60 text-xs font-medium">N/A</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs font-medium mb-1">Signal</div>
                      <div className="flex items-center gap-2">
                        {device.signalStrength !== null ? (
                          <>
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full transition-all duration-300',
                                  device.signalStrength > 70 ? 'bg-green-400' :
                                  device.signalStrength > 40 ? 'bg-amber-400' : 'bg-red-400'
                                )}
                                style={{ width: `${device.signalStrength}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-xs font-bold">{device.signalStrength}%</span>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gray-500 w-full opacity-50"></div>
                            </div>
                            <span className="text-white/60 text-xs font-medium">N/A</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Temperature:</span>
                      <span className="text-white font-medium">
                        {device.temperature !== null ? `${device.temperature}°C` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Geo ID:</span>
                      <span className="text-white font-medium">{device.geoid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Created:</span>
                      <span className="text-white font-medium text-xs">{device.createdAt}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/devices/${device.imei}`);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/devices/${device.imei}/settings`);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
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
      )}

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

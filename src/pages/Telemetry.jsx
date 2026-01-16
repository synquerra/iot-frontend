import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { getAnalyticsByImei } from "../utils/analytics";
import { 
  transformDeviceInfo, 
  transformLiveData, 
  transformPacketData 
} from "../utils/telemetryTransformers";
import { listDevicesFiltered } from "../utils/deviceFiltered";
import { useDeviceFilter } from "../hooks/useDeviceFilter";

export default function Telemetry() {
  const [activeTab, setActiveTab] = useState("live");
  const [deviceContext, setDeviceContext] = useState(null);
  const [imeiError, setImeiError] = useState(null);
  const [deviceImei, setDeviceImei] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use device filter hook for user-based filtering
  const { filterDevices, shouldFilterDevices } = useDeviceFilter();
  
  // Load available devices with filtering
  useEffect(() => {
    async function loadDevices() {
      try {
        setLoadingDevices(true);
        const { devices: items } = await listDevicesFiltered();
        
        // Apply user-based device filtering (PARENTS vs ADMIN)
        const filteredItems = filterDevices(items);
        setAvailableDevices(filteredItems);
      } catch (err) {
        console.error('Failed to load devices:', err);
        setAvailableDevices([]);
      } finally {
        setLoadingDevices(false);
      }
    }
    
    loadDevices();
  }, [filterDevices]);
  
  // Parse device IMEI from URL parameters with validation
  const parseDeviceImei = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const imeiParam = urlParams.get('imei');
    
    // Clear previous IMEI error
    setImeiError(null);
    
    if (!imeiParam) {
      // No IMEI provided - use first available device or default
      if (availableDevices.length > 0) {
        const firstDevice = availableDevices[0];
        setDeviceContext({
          imei: firstDevice.imei,
          isDefault: true,
          source: 'first-available'
        });
        setDeviceImei(firstDevice.imei);
      } else if (!loadingDevices) {
        // No devices available after loading
        setImeiError('No authorized devices available for your account.');
        setDeviceContext(null);
        setDeviceImei(null);
      }
      return;
    }
    
    // Validate IMEI format (15 digits)
    const imeiRegex = /^\d{15}$/;
    if (!imeiRegex.test(imeiParam)) {
      setImeiError(`Invalid IMEI format: ${imeiParam}. IMEI must be 15 digits.`);
      setDeviceContext({
        imei: imeiParam,
        isDefault: false,
        source: 'url',
        isValid: false
      });
      setDeviceImei(null); // Set null for invalid IMEI
      return;
    }
    
    // Check if device is authorized (for PARENTS users)
    if (shouldFilterDevices() && availableDevices.length > 0) {
      const isAuthorized = availableDevices.some(
        device => device.imei.toLowerCase() === imeiParam.toLowerCase()
      );
      
      if (!isAuthorized) {
        setImeiError(`Access denied: Device ${imeiParam} is not authorized for your account.`);
        setDeviceContext({
          imei: imeiParam,
          isDefault: false,
          source: 'url',
          isValid: true,
          isAuthorized: false
        });
        setDeviceImei(null);
        return;
      }
    }
    
    // Valid and authorized IMEI from URL
    setDeviceContext({
      imei: imeiParam,
      isDefault: false,
      source: 'url',
      isValid: true,
      isAuthorized: true
    });
    setDeviceImei(imeiParam);
  }, [location.search, availableDevices, loadingDevices, shouldFilterDevices]);
  
  // Parse IMEI when URL changes
  useEffect(() => {
    parseDeviceImei();
  }, [parseDeviceImei]);
  
  // Device switching functionality
  const switchDevice = useCallback((newImei) => {
    if (!newImei) {
      // Switch to first available device
      navigate('/telemetry', { replace: true });
    } else {
      // Switch to specific device
      navigate(`/telemetry?imei=${newImei}`, { replace: true });
    }
    // Data clearing will happen automatically when the component re-renders with new IMEI
  }, [navigate]);
  
  // State for telemetry data
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load telemetry data directly without caching (like DeviceDetails)
  const loadTelemetryData = useCallback(async () => {
    if (!deviceImei) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const analyticsData = await getAnalyticsByImei(deviceImei);
      
      if (analyticsData && analyticsData.length > 0) {
        setTelemetryData({
          deviceInfo: transformDeviceInfo(analyticsData, deviceImei),
          liveData: transformLiveData(analyticsData),
          packetData: transformPacketData(analyticsData)
        });
      } else {
        setTelemetryData(null);
      }
    } catch (err) {
      console.error('Failed to load telemetry data:', err);
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [deviceImei]);

  // Load data when device IMEI changes
  useEffect(() => {
    loadTelemetryData();
  }, [loadTelemetryData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await loadTelemetryData();
  }, [loadTelemetryData]);

  const hasData = !!telemetryData;

  // Static E-SIM data (preserved as per requirements)
  const esimData = {
    sim1: "Active",
    sim2: "Inactive"
  };

  const tabs = [
    { id: "live", label: "Live Data", icon: "📡" },
    { id: "packets", label: "Packets", icon: "📦" },
    { id: "esim", label: "E-SIM", icon: "📱" },
    { id: "controls", label: "Controls", icon: "🎛️" }
  ];

  // Handle refresh button click
  const handleRefresh = async () => {
    await refreshData();
  };

  // Handle retry for failed requests
  const handleRetry = async () => {
    try {
      await retryFailedRequests();
    } catch (error) {
      console.error('Retry failed:', error);
      // Error is already handled by the hook, just log it
    }
  };

  // Handle tab switching - maintain device context across tabs
  const handleTabSwitch = useCallback((tabId) => {
    setActiveTab(tabId);
    // Device context is maintained automatically through URL parameters
  }, []);

  // Show IMEI validation error
  if (imeiError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" colorScheme="red" padding="lg" className="max-w-2xl">
          <Card.Content>
            <div className="text-center">
              <div className="text-red-300 text-lg font-semibold mb-2">
                {deviceContext?.isAuthorized === false ? 'Unauthorized Device Access' : 'Invalid Device IMEI'}
              </div>
              <div className="text-red-200/80 text-sm mb-4">{imeiError}</div>
              
              {/* Device selector dropdown */}
              {availableDevices.length > 0 && (
                <div className="mb-4">
                  <label className="block text-red-200/70 text-sm mb-2">
                    Select an authorized device:
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    onChange={(e) => switchDevice(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a device...</option>
                    {availableDevices.map((device) => (
                      <option key={device.imei} value={device.imei} className="bg-slate-800">
                        {device.imei} {device.topic ? `(${device.topic})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                {availableDevices.length > 0 ? (
                  <Button
                    variant="glass"
                    colorScheme="blue"
                    onClick={() => switchDevice(null)}
                  >
                    Use First Available Device
                  </Button>
                ) : (
                  <div className="text-red-200/60 text-xs">
                    No authorized devices available for your account.
                  </div>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          type="spinner" 
          size="xl" 
          color="blue"
          text="Loading telemetry data..." 
          textPosition="bottom"
        />
      </div>
    );
  }

  // Show error state
  if (error && !hasData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" colorScheme="red" padding="lg" className="max-w-2xl">
          <Card.Content>
            <div className="text-center">
              <div className="text-red-300 text-lg font-semibold mb-2">Error Loading Data</div>
              <div className="text-red-200/80 text-sm mb-2">
                {error.userMessage || error.message || 'Failed to load telemetry data'}
              </div>
              {deviceContext && (
                <div className="text-red-200/60 text-xs mb-4">
                  Device: {deviceContext.imei} 
                  {deviceContext.isDefault && " (default)"}
                </div>
              )}
              
              {/* Error details for debugging */}
              {error.statusCode && (
                <div className="text-red-200/50 text-xs mb-4">
                  Error Code: {error.statusCode}
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  variant="glass"
                  colorScheme="blue"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                
                {!deviceContext?.isDefault && (
                  <Button
                    variant="glass"
                    colorScheme="slate"
                    onClick={() => switchDevice(null)}
                  >
                    Try Default Device
                  </Button>
                )}
              </div>
              
              {/* Network troubleshooting tips */}
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                <div className="text-red-300 text-sm font-semibold mb-1">Troubleshooting Tips:</div>
                <ul className="text-red-200/70 text-xs space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Verify the device IMEI is correct</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // Show no data state
  if (!hasData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" colorScheme="slate" padding="lg">
          <Card.Content>
            <div className="text-center">
              <div className="text-white text-lg font-semibold mb-2">No Data Available</div>
              <div className="text-white/70 text-sm mb-2">
                No telemetry data found for device {deviceContext?.imei || 'unknown'}
              </div>
              {deviceContext && (
                <div className="text-white/50 text-xs mb-4">
                  Source: {deviceContext.source}
                  {deviceContext.isDefault && " (default device)"}
                </div>
              )}
              <div className="space-y-2">
                <Button
                  variant="glass"
                  colorScheme="blue"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                {!deviceContext?.isDefault && (
                  <Button
                    variant="glass"
                    colorScheme="slate"
                    onClick={() => switchDevice(null)}
                  >
                    Try Default Device
                  </Button>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20 border border-blue-500/30 backdrop-blur-xl">
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
                  Data Telemetry
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
                Real-time telemetry monitoring and packet analysis for IoT devices
              </p>
              {deviceContext && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-blue-200/70">Device:</span>
                  <span className="text-blue-100 font-mono">{deviceContext.imei}</span>
                  {deviceContext.isDefault && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Device Status</div>
                <div className={cn(
                  "text-xl font-bold",
                  telemetryData.deviceInfo?.status === 'Online' 
                    ? "text-green-300" 
                    : "text-red-300"
                )}>
                  {telemetryData.deviceInfo?.status || 'Unknown'}
                </div>
                <div className="text-blue-200/70 text-xs flex items-center gap-1">
                  <span>Last: {telemetryData.deviceInfo?.lastSeen || 'Unknown'}</span>
                  {telemetryData.deviceInfo?.isRecent && (
                    <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                      Recent
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="glass"
                colorScheme="teal"
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="backdrop-blur-xl"
              >
                <svg className={cn(
                  "w-5 h-5 mr-2",
                  isRefreshing && "animate-spin"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtering Info Box for PARENTS users */}
      {shouldFilterDevices() && (
        <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-blue-200 font-medium text-sm mb-1">
                Viewing Assigned Devices Only
              </div>
              <div className="text-blue-200/70 text-sm leading-relaxed">
                You can only view telemetry data for {availableDevices.length} device{availableDevices.length !== 1 ? 's' : ''} assigned to your account. 
                Contact your administrator to modify device assignments.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <Card variant="glass" colorScheme="slate" padding="sm" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Tab Content */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-blue-200/80 text-sm font-medium mb-1">IMEI</div>
                    <div className="text-white text-lg font-bold mb-2 font-mono">
                      {telemetryData.deviceInfo?.imei || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200/70 text-xs">Device ID</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-purple-200/80 text-sm font-medium mb-1">Firmware</div>
                    <div className="text-white text-lg font-bold mb-2">
                      {telemetryData.deviceInfo?.firmware || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-200/70 text-xs">Version</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme={telemetryData.deviceInfo?.status === 'Online' ? 'green' : telemetryData.deviceInfo?.status === 'Unknown' ? 'slate' : 'red'} padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      telemetryData.deviceInfo?.status === 'Online' ? 'text-green-200/80' : 
                      telemetryData.deviceInfo?.status === 'Unknown' ? 'text-slate-200/80' : 'text-red-200/80'
                    )}>Status</div>
                    <div className="text-white text-lg font-bold mb-2">
                      {telemetryData.deviceInfo?.status || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        telemetryData.deviceInfo?.status === 'Online' ? 'bg-green-400' : 
                        telemetryData.deviceInfo?.status === 'Unknown' ? 'bg-slate-400' : 'bg-red-400'
                      )}></div>
                      <span className={cn(
                        "text-xs",
                        telemetryData.deviceInfo?.status === 'Online' ? 'text-green-200/70' : 
                        telemetryData.deviceInfo?.status === 'Unknown' ? 'text-slate-200/70' : 'text-red-200/70'
                      )}>
                        {telemetryData.deviceInfo?.status === 'Online' ? 'Connected' : 
                         telemetryData.deviceInfo?.status === 'Unknown' ? 'Status Unknown' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-amber-200/80 text-sm font-medium mb-1">Last Seen</div>
                    <div className="text-white text-sm font-bold mb-2">
                      {telemetryData.deviceInfo?.lastSeen || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-200/70 text-xs">
                        {telemetryData.deviceInfo?.isRecent ? 'Recent' : 'Timestamp'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Live Telemetry Data */}
          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Live Telemetry Data
              </h3>
              
              {telemetryData.liveData ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-green-200/80 text-xs font-medium mb-2">Latitude</div>
                      <div className="text-white font-bold text-lg">{telemetryData.liveData.latitude}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-green-200/80 text-xs font-medium mb-2">Longitude</div>
                      <div className="text-white font-bold text-lg">{telemetryData.liveData.longitude}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-green-200/80 text-xs font-medium mb-2">Speed</div>
                      <div className={cn(
                        "font-bold text-lg",
                        telemetryData.liveData.hasHighSpeed ? "text-red-300" : "text-white"
                      )}>
                        {telemetryData.liveData.speed} km/h
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-green-200/80 text-xs font-medium mb-2">Temperature</div>
                      <div className={cn(
                        "font-bold text-lg",
                        telemetryData.liveData.hasHighTemp ? "text-orange-300" : "text-white"
                      )}>
                        {telemetryData.liveData.temperature}°C
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-green-200/80 text-sm">Battery Level</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-white/20 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              telemetryData.liveData.battery >= 50 ? "bg-green-400" :
                              telemetryData.liveData.battery >= 20 ? "bg-yellow-400" :
                              "bg-red-400"
                            )}
                            style={{ width: `${telemetryData.liveData.battery}%` }}
                          ></div>
                        </div>
                        <span className={cn(
                          "font-bold",
                          telemetryData.liveData.battery >= 50 ? "text-green-300" :
                          telemetryData.liveData.battery >= 20 ? "text-yellow-300" :
                          "text-red-300"
                        )}>{telemetryData.liveData.battery}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/70 text-lg font-semibold mb-2">No Live Data Available</div>
                  <div className="text-white/50 text-sm mb-4">
                    Unable to load live telemetry data for this device
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "packets" && (
        <div className="space-y-6">
          {/* Normal Packet */}
          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Normal Packet (N)
              </h3>
              {telemetryData.packetData?.normalPacket ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-200/80 text-xs font-medium mb-2">Latitude</div>
                    <div className="text-white font-mono text-lg">{telemetryData.packetData.normalPacket.lat.toFixed(6)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-200/80 text-xs font-medium mb-2">Longitude</div>
                    <div className="text-white font-mono text-lg">{telemetryData.packetData.normalPacket.lng.toFixed(6)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-200/80 text-xs font-medium mb-2">Speed</div>
                    <div className="text-white text-lg">{telemetryData.packetData.normalPacket.speed} km/h</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-200/80 text-xs font-medium mb-2">Temperature</div>
                    <div className="text-white text-lg">{telemetryData.packetData.normalPacket.temp}°C</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-200/80 text-xs font-medium mb-2">Battery</div>
                    <div className="text-white text-lg">{telemetryData.packetData.normalPacket.battery}%</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/70 text-lg font-semibold mb-2">No Packet Data</div>
                  <div className="text-white/50 text-sm mb-4">No normal packet data available for this device</div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Error Packet */}
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Error Packet (E)
              </h3>
              {telemetryData.packetData?.errorPacket ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-red-200/80 text-sm font-medium">Error Code</span>
                      <span className="text-white font-mono bg-red-500/20 px-3 py-1 rounded text-sm">{telemetryData.packetData.errorPacket.code}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-2">
                      <span className="text-red-200/80 text-sm font-medium">Timestamp</span>
                      <span className="text-white text-sm font-mono">{telemetryData.packetData.errorPacket.timestamp}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-300 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No Errors
                  </div>
                  <div className="text-white/70 text-sm">No error packets found for this device</div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "esim" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                E-SIM Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="glass" colorScheme="green" padding="lg">
                  <Card.Content>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-lg">SIM 1</h4>
                      <div className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                        {esimData.sim1}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Status</span>
                        <span className="text-green-400 font-semibold">{esimData.sim1}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Signal Strength</span>
                        <span className="text-white">85%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/70">Data Usage</span>
                        <span className="text-white">2.3 GB</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card variant="glass" colorScheme="red" padding="lg">
                  <Card.Content>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-lg">SIM 2</h4>
                      <div className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full">
                        {esimData.sim2}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Status</span>
                        <span className="text-red-400 font-semibold">{esimData.sim2}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Signal Strength</span>
                        <span className="text-white">0%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/70">Data Usage</span>
                        <span className="text-white">0 GB</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                Device Controls
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="glass"
                  colorScheme="amber"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  SOS
                </Button>
                <Button
                  variant="glass"
                  colorScheme="green"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ACK
                </Button>
                <Button
                  variant="glass"
                  colorScheme="red"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  OFF
                </Button>
              </div>
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-amber-300 font-semibold text-sm">Warning</span>
                </div>
                <p className="text-amber-200 text-sm">
                  These controls send direct commands to your device. Use with caution as they may affect device operation.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}

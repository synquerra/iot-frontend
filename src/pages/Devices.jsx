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
  const [showTamperedAlert, setShowTamperedAlert] = useState(false);
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);
  const [showHangedAlert, setShowHangedAlert] = useState(false);
  const [showHighTempAlert, setShowHighTempAlert] = useState(false);
  const [showSosAlert, setShowSosAlert] = useState(false);
  const [showOverspeedAlert, setShowOverspeedAlert] = useState(false);
  const [showSimIssueAlert, setShowSimIssueAlert] = useState(false);
  const [showDataIssueAlert, setShowDataIssueAlert] = useState(false);
  const [showGpsIssueAlert, setShowGpsIssueAlert] = useState(false);
  const [showLowBatteryAlert, setShowLowBatteryAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  
  // Card visibility state
  const [visibleCards, setVisibleCards] = useState({
    total: true,
    active: true,
    inactive: true,
    hanged: true,
    tampered: true,
    highTemp: true,
    sos: true,
    overspeed: true,
    anomaly: true,
    restrictedEntry: true,
    simNotWorking: true,
    lowData: true,
    gpsUplinkIssues: true,
    batteryHealth: true,
    ble: true,
  });
  const [showCardFilter, setShowCardFilter] = useState(false);
  
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
              
              // SOS incidents with detailed data
              const sosPackets = packets.filter(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'A1002' || alert === 'SOS';
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: p.alert,
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasSOS = sosPackets.length > 0;
              const sosIncidents = sosPackets.length;
              
              // Overspeed incidents with detailed data
              const overspeedPackets = packets.filter(p => Number(p.speed) > 70).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: 'OVERSPEED',
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasOverspeed = overspeedPackets.length > 0;
              const overspeedIncidents = overspeedPackets.length;
              
              // High temperature incidents with detailed data
              const highTempPackets = packets.filter(p => {
                if (p.rawTemperature !== null && p.rawTemperature !== undefined) {
                  const tempNum = parseTemperature(p.rawTemperature);
                  return tempNum > 50;
                }
                return false;
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: 'HIGH_TEMP',
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasHighTemp = temperature !== null && temperature > 50;
              const highTempIncidents = highTempPackets.length;
              
              // Low battery incidents with detailed data
              const lowBatteryPackets = packets.filter(p => {
                if (p.battery !== null && p.battery !== undefined) {
                  const batteryNum = Number(p.battery);
                  return !isNaN(batteryNum) && batteryNum < 20;
                }
                return false;
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: 'LOW_BATTERY',
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasLowBattery = batteryLevel !== null && batteryLevel < 20;
              const lowBatteryIncidents = lowBatteryPackets.length;
              
              // Tampered incidents with detailed data
              const tamperedPackets = packets.filter(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'A1003' || alert === 'TAMPERED';
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: p.alert,
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasTampered = tamperedPackets.length > 0;
              const tamperedIncidents = tamperedPackets.length;
              
              // SIM issue incidents with detailed data
              const simIssuePackets = packets.filter(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1011' || alert === 'NO_SIM' || alert === 'NO SIM';
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: p.alert,
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasSimIssue = simIssuePackets.length > 0;
              const simIssueIncidents = simIssuePackets.length;
              
              // Data issue incidents with detailed data
              const dataIssuePackets = packets.filter(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1003' || alert === 'NO_DATA_CAPABILITY' || alert === 'NO DATA CAPABILITY';
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: p.alert,
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasDataIssue = dataIssuePackets.length > 0;
              const dataIssueIncidents = dataIssuePackets.length;
              
              // GPS issue incidents with detailed data
              const gpsIssuePackets = packets.filter(p => {
                const alert = String(p.alert || '').toUpperCase();
                return alert === 'E1001' || alert === 'GNSS_ERROR' || alert === 'GNSS CONNECTIVITY' || alert === 'A1004' || alert === 'GPS_DISABLED' || alert === 'GPS DISABLE';
              }).map(p => ({
                timestamp: p.deviceTimestamp || p.timestamp,
                alert: p.alert,
                latitude: p.latitude,
                longitude: p.longitude,
                battery: p.battery,
                signal: p.signal,
              }));
              const hasGpsIssue = gpsIssuePackets.length > 0;
              const gpsIssueIncidents = gpsIssuePackets.length;

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
                sosIncidents,
                sosPackets,
                hasOverspeed,
                overspeedIncidents,
                overspeedPackets,
                hasHighTemp,
                highTempIncidents,
                highTempPackets,
                hasLowBattery,
                lowBatteryIncidents,
                lowBatteryPackets,
                hasTampered,
                tamperedIncidents,
                tamperedPackets,
                hasSimIssue,
                simIssueIncidents,
                simIssuePackets,
                hasDataIssue,
                dataIssueIncidents,
                dataIssuePackets,
                hasGpsIssue,
                gpsIssueIncidents,
                gpsIssuePackets,
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
                sosIncidents: 0,
                sosPackets: [],
                hasOverspeed: false,
                overspeedIncidents: 0,
                overspeedPackets: [],
                hasHighTemp: false,
                highTempIncidents: 0,
                highTempPackets: [],
                hasLowBattery: false,
                lowBatteryIncidents: 0,
                lowBatteryPackets: [],
                hasTampered: false,
                tamperedIncidents: 0,
                tamperedPackets: [],
                hasSimIssue: false,
                simIssueIncidents: 0,
                simIssuePackets: [],
                hasDataIssue: false,
                dataIssueIncidents: 0,
                dataIssuePackets: [],
                hasGpsIssue: false,
                gpsIssueIncidents: 0,
                gpsIssuePackets: [],
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

  // Generic function to render incident table
  const renderIncidentTable = (config) => {
    const {
      title,
      showAlert,
      setShowAlert,
      devices: allDevices,
      filterFn,
      getIncidentsFn,
      color = 'red',
      icon = 'exclamation-triangle'
    } = config;

    if (!showAlert) return null;

    // Get all incidents
    const allIncidents = allDevices
      .filter(filterFn)
      .flatMap(device => {
        const incidents = getIncidentsFn(device);
        return incidents.map((incident, idx) => ({
          device,
          incident,
          incidentIndex: idx
        }));
      });

    if (allIncidents.length === 0) return null;

    // Calculate pagination
    const totalPages = Math.ceil(allIncidents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedIncidents = allIncidents.slice(startIndex, endIndex);

    return (
      <div className="bg-white rounded-lg shadow-md border-l-4 border-red-600">
        <div className="border-b border-gray-200 px-4 py-3 bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <i className={`fas fa-${icon} text-white text-lg`}></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                {title}
              </h3>
              <p className="text-sm text-red-600">
                {allIncidents.length} total incident{allIncidents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAlert(false);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <i className="fas fa-times"></i>
            Close
          </button>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Device</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Timestamp</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Alert</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Location</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Battery</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Signal</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncidents.map((item, idx) => {
                  const { device, incident } = item;
                  const globalIdx = startIndex + idx;
                  const timestamp = new Date(incident.timestamp);
                  const formattedDate = timestamp.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <tr 
                      key={`${device.imei}-${globalIdx}`} 
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">{globalIdx + 1}</td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">{getDeviceDisplayNameWithMaskedImei(device)}</td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">
                        <div>{formattedDate}</div>
                        <div className="text-gray-600">{formattedTime}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          {incident.alert || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">
                        {incident.latitude && incident.longitude ? (
                          <div>
                            <div>{Number(incident.latitude).toFixed(4)}</div>
                            <div>{Number(incident.longitude).toFixed(4)}</div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">
                        {incident.battery !== null && incident.battery !== undefined ? `${Math.round(incident.battery)}%` : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 border border-gray-300">
                        {incident.signal !== null && incident.signal !== undefined ? `${Math.round(incident.signal)}%` : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs border border-gray-300">
                        <button
                          onClick={() => {
                            alert(`Reset incident for device ${device.imei} at ${formattedDate} ${formattedTime}`);
                          }}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium flex items-center gap-1"
                        >
                          <i className="fas fa-redo"></i>
                          Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {startIndex + 1} to {Math.min(endIndex, allIncidents.length)} of {allIncidents.length} incidents
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      'px-3 py-1 rounded text-sm font-medium',
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    )}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {(() => {
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      const pages = [];
                      
                      // First page
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="w-8 h-8 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
                        }
                      }
                      
                      // Visible pages
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={cn(
                              'w-8 h-8 rounded text-sm font-medium',
                              currentPage === i
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            )}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      'px-3 py-1 rounded text-sm font-medium',
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Determine if search & filters should be shown
  // Show if: ADMIN (always) OR Parent with 2+ devices
  const shouldShowSearchFilters = useMemo(() => {
    if (isAdmin()) {
      return true; // Always show for ADMIN
    }
    // For PARENTS, only show if they have 2 or more devices
    return devices.length >= 2;
  }, [isAdmin, devices.length]);

  const stats = useMemo(() => {
    // Calculate total incidents count for each category
    const totalTamperedIncidents = devices.reduce((total, device) => total + (device.tamperedIncidents || 0), 0);
    const totalSosIncidents = devices.reduce((total, device) => total + (device.sosIncidents || 0), 0);
    const totalOverspeedIncidents = devices.reduce((total, device) => total + (device.overspeedIncidents || 0), 0);
    const totalHighTempIncidents = devices.reduce((total, device) => total + (device.highTempIncidents || 0), 0);
    const totalLowBatteryIncidents = devices.reduce((total, device) => total + (device.lowBatteryIncidents || 0), 0);
    const totalSimIssueIncidents = devices.reduce((total, device) => total + (device.simIssueIncidents || 0), 0);
    const totalDataIssueIncidents = devices.reduce((total, device) => total + (device.dataIssueIncidents || 0), 0);
    const totalGpsIssueIncidents = devices.reduce((total, device) => total + (device.gpsIssueIncidents || 0), 0);

    return {
      // Row 1
      total: devices.length,
      active: devices.filter(d => d.status === "active").length,
      inactive: devices.filter(d => d.status === "inactive").length,
      inactiveIncidents: devices.filter(d => d.status === "inactive").length, // Count of inactive devices
      hanged: devices.filter(d => d.isHanged).length,
      hangedIncidents: devices.filter(d => d.isHanged).length, // Count of hanged devices
      tampered: devices.filter(d => d.hasTampered).length,
      totalTamperedIncidents,
      
      // Row 2
      highTemp: devices.filter(d => d.hasHighTemp).length,
      totalHighTempIncidents,
      sos: devices.filter(d => d.hasSOS).length,
      totalSosIncidents,
      overspeed: devices.filter(d => d.hasOverspeed).length,
      totalOverspeedIncidents,
      anomaly: 0,
      totalAnomalyIncidents: 0,
      restrictedEntry: 0,
      totalRestrictedEntryIncidents: 0,
      
      // Row 3
      simNotWorking: devices.filter(d => d.hasSimIssue).length,
      totalSimIssueIncidents,
      lowData: devices.filter(d => d.hasDataIssue).length,
      totalDataIssueIncidents,
      gpsUplinkIssues: devices.filter(d => d.hasGpsIssue).length,
      totalGpsIssueIncidents,
      batteryHealth: devices.filter(d => d.hasLowBattery).length,
      totalLowBatteryIncidents,
      ble: 0,
      totalBleIncidents: 0,
    };
  }, [devices]);

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

      {/* Card Filter Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div 
          className="border-b border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowCardFilter(!showCardFilter)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-filter text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Card Visibility Filter</h3>
              <p className="text-sm text-gray-600">
                {Object.values(visibleCards).filter(Boolean).length} of {Object.keys(visibleCards).length} cards visible
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <i className={`fas fa-chevron-${showCardFilter ? 'up' : 'down'}`}></i>
            {showCardFilter ? 'Hide' : 'Show'} Filter
          </button>
        </div>
        
        {showCardFilter && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Select cards to display</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibleCards(Object.keys(visibleCards).reduce((acc, key) => ({ ...acc, [key]: true }), {}))}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                >
                  <i className="fas fa-check-double mr-1"></i>
                  Select All
                </button>
                <button
                  onClick={() => setVisibleCards(Object.keys(visibleCards).reduce((acc, key) => ({ ...acc, [key]: false }), {}))}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                >
                  <i className="fas fa-times mr-1"></i>
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Row 1 Cards */}
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.total}
                  onChange={(e) => setVisibleCards({ ...visibleCards, total: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Total Devices</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.active}
                  onChange={(e) => setVisibleCards({ ...visibleCards, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.inactive}
                  onChange={(e) => setVisibleCards({ ...visibleCards, inactive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Inactive</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.hanged}
                  onChange={(e) => setVisibleCards({ ...visibleCards, hanged: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Hanged</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.tampered}
                  onChange={(e) => setVisibleCards({ ...visibleCards, tampered: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Tampered</span>
              </label>
              
              {/* Row 2 Cards */}
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.highTemp}
                  onChange={(e) => setVisibleCards({ ...visibleCards, highTemp: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">High Temp</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.sos}
                  onChange={(e) => setVisibleCards({ ...visibleCards, sos: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">SOS</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.overspeed}
                  onChange={(e) => setVisibleCards({ ...visibleCards, overspeed: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Overspeed</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.anomaly}
                  onChange={(e) => setVisibleCards({ ...visibleCards, anomaly: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Anomaly</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.restrictedEntry}
                  onChange={(e) => setVisibleCards({ ...visibleCards, restrictedEntry: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Restricted Entry</span>
              </label>
              
              {/* Row 3 Cards */}
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.simNotWorking}
                  onChange={(e) => setVisibleCards({ ...visibleCards, simNotWorking: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">SIM Not Working</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.lowData}
                  onChange={(e) => setVisibleCards({ ...visibleCards, lowData: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Low Data</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.gpsUplinkIssues}
                  onChange={(e) => setVisibleCards({ ...visibleCards, gpsUplinkIssues: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">GPS Issues</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.batteryHealth}
                  onChange={(e) => setVisibleCards({ ...visibleCards, batteryHealth: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Battery Health</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={visibleCards.ble}
                  onChange={(e) => setVisibleCards({ ...visibleCards, ble: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">BLE</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* All Cards - Single Grid for Auto-Arrangement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Devices */}
        {visibleCards.total && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm font-medium mt-1">Total Devices</div>
            <div className="h-5 mt-1"></div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-microchip text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            All registered
          </div>
        </div>
        )}

        {/* Active */}
        {visibleCards.active && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#28a745] to-[#218838] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.active}</div>
            <div className="text-sm font-medium mt-1">Active</div>
            <div className="h-5 mt-1"></div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-check-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Online now
          </div>
        </div>
        )}

        {/* Inactive */}
        {visibleCards.inactive && (
        <div 
          onClick={() => setShowInactiveAlert(!showInactiveAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.inactive}</div>
            <div className="text-sm font-medium mt-1">Inactive Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.inactiveIncidents} device{stats.inactiveIncidents !== 1 ? 's' : ''} offline
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation-triangle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Offline
          </div>
        </div>
        )}

        {/* Hanged */}
        {visibleCards.hanged && (
        <div 
          onClick={() => setShowHangedAlert(!showHangedAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.hanged}</div>
            <div className="text-sm font-medium mt-1">Hanged Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.hangedIncidents} device{stats.hangedIncidents !== 1 ? 's' : ''} not responding
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-times-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Not responding
          </div>
        </div>
        )}

        {/* Tampered */}
        {visibleCards.tampered && (
        <div 
          onClick={() => setShowTamperedAlert(!showTamperedAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6f42c1] to-[#5a32a3] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.tampered}</div>
            <div className="text-sm font-medium mt-1">Tampered Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalTamperedIncidents} total incidents
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-shield-alt text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Security alert
          </div>
        </div>
        )}

        {/* High Temp */}
        {visibleCards.highTemp && (
        <div 
          onClick={() => setShowHighTempAlert(!showHighTempAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.highTemp}</div>
            <div className="text-sm font-medium mt-1">High Temp Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalHighTempIncidents} total incident{stats.totalHighTempIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-thermometer-full text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            &gt;50°C
          </div>
        </div>
        )}

        {/* SOS */}
        {visibleCards.sos && (
        <div 
          onClick={() => setShowSosAlert(!showSosAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#fd7e14] to-[#e8590c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.sos}</div>
            <div className="text-sm font-medium mt-1">SOS Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalSosIncidents} total incident{stats.totalSosIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation-circle text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Emergency
          </div>
        </div>
        )}

        {/* Overspeed */}
        {visibleCards.overspeed && (
        <div 
          onClick={() => setShowOverspeedAlert(!showOverspeedAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.overspeed}</div>
            <div className="text-sm font-medium mt-1">Overspeed Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalOverspeedIncidents} total incident{stats.totalOverspeedIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-tachometer-alt text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            &gt;70 km/h
          </div>
        </div>
        )}

        {/* Anomaly */}
        {visibleCards.anomaly && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#e83e8c] to-[#d63384] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.anomaly}</div>
            <div className="text-sm font-medium mt-1">Anomaly Devices</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalAnomalyIncidents} total incident{stats.totalAnomalyIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-exclamation text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Unusual behavior
          </div>
        </div>
        )}

        {/* Restricted Entry */}
        {visibleCards.restrictedEntry && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6610f2] to-[#520dc2] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.restrictedEntry}</div>
            <div className="text-sm font-medium mt-1">Restricted Entry</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalRestrictedEntryIncidents} total incident{stats.totalRestrictedEntryIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-ban text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Geofence breach
          </div>
        </div>
        )}

        {/* SIM Not Working */}
        {visibleCards.simNotWorking && (
        <div 
          onClick={() => setShowSimIssueAlert(!showSimIssueAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.simNotWorking}</div>
            <div className="text-sm font-medium mt-1">SIM Not Working</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalSimIssueIncidents} total incident{stats.totalSimIssueIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-sim-card text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            No SIM
          </div>
        </div>
        )}

        {/* Low Data */}
        {visibleCards.lowData && (
        <div 
          onClick={() => setShowDataIssueAlert(!showDataIssueAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.lowData}</div>
            <div className="text-sm font-medium mt-1">Low Data</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalDataIssueIncidents} total incident{stats.totalDataIssueIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-database text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Data issue
          </div>
        </div>
        )}

        {/* GPS Uplink Issues */}
        {visibleCards.gpsUplinkIssues && (
        <div 
          onClick={() => setShowGpsIssueAlert(!showGpsIssueAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#fd7e14] to-[#e8590c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.gpsUplinkIssues}</div>
            <div className="text-sm font-medium mt-1">GPS Issues</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalGpsIssueIncidents} total incident{stats.totalGpsIssueIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-satellite-dish text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            GNSS error
          </div>
        </div>
        )}

        {/* Battery Health */}
        {visibleCards.batteryHealth && (
        <div 
          onClick={() => setShowLowBatteryAlert(!showLowBatteryAlert)}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#6f42c1] to-[#5a32a3] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.batteryHealth}</div>
            <div className="text-sm font-medium mt-1">Battery Health</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalLowBatteryIncidents} total incident{stats.totalLowBatteryIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-battery-quarter text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Low battery
          </div>
        </div>
        )}

        {/* BLE */}
        {visibleCards.ble && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.ble}</div>
            <div className="text-sm font-medium mt-1">BLE</div>
            <div className="text-xs mt-1 opacity-80">
              {stats.totalBleIncidents} total incident{stats.totalBleIncidents !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-bluetooth text-6xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-xs">
            Bluetooth
          </div>
        </div>
        )}
      </div>

      {/* Incident Tables Section - Wrapped in proper container */}
      <div className="space-y-4">
        {/* Tampered Devices Alert */}
        {renderIncidentTable({
          title: 'Tampered Incidents History',
          showAlert: showTamperedAlert,
          setShowAlert: setShowTamperedAlert,
          devices: devices,
          filterFn: (d) => d.hasTampered,
          getIncidentsFn: (device) => device.tamperedPackets || [],
          icon: 'shield-alt'
        })}

        {/* Inactive Devices Alert */}
        {stats.inactive > 0 && renderIncidentTable({
          title: 'Inactive Devices History',
          showAlert: showInactiveAlert,
          setShowAlert: setShowInactiveAlert,
          devices: devices,
          filterFn: (d) => d.status === 'inactive',
          getIncidentsFn: (device) => [{
            timestamp: device.lastSeen,
            alert: 'INACTIVE',
            latitude: null,
            longitude: null,
            battery: device.batteryLevel,
            signal: device.signalStrength
          }],
          icon: 'power-off'
        })}

        {/* Hanged Devices Alert */}
        {stats.hanged > 0 && renderIncidentTable({
          title: 'Hanged Devices History',
          showAlert: showHangedAlert,
          setShowAlert: setShowHangedAlert,
          devices: devices,
          filterFn: (d) => d.isHanged,
          getIncidentsFn: (device) => [{
            timestamp: device.lastSeen,
            alert: 'HANGED',
            latitude: null,
            longitude: null,
            battery: device.batteryLevel,
            signal: device.signalStrength
          }],
          icon: 'times-circle'
        })}

        {/* High Temp Alert */}
        {stats.highTemp > 0 && renderIncidentTable({
          title: 'High Temperature Incidents',
          showAlert: showHighTempAlert,
          setShowAlert: setShowHighTempAlert,
          devices: devices,
          filterFn: (d) => d.hasHighTemp,
          getIncidentsFn: (device) => device.highTempPackets || [],
          icon: 'thermometer-full'
        })}

        {/* SOS Alert */}
        {stats.sos > 0 && renderIncidentTable({
          title: 'SOS Incidents',
          showAlert: showSosAlert,
          setShowAlert: setShowSosAlert,
          devices: devices,
          filterFn: (d) => d.hasSOS,
          getIncidentsFn: (device) => device.sosPackets || [],
          icon: 'exclamation-circle'
        })}

        {/* Overspeed Alert */}
        {stats.overspeed > 0 && renderIncidentTable({
          title: 'Overspeed Incidents',
          showAlert: showOverspeedAlert,
          setShowAlert: setShowOverspeedAlert,
          devices: devices,
          filterFn: (d) => d.hasOverspeed,
          getIncidentsFn: (device) => device.overspeedPackets || [],
          icon: 'tachometer-alt'
        })}

        {/* SIM Issue Alert */}
        {stats.simNotWorking > 0 && renderIncidentTable({
          title: 'SIM Issue Incidents',
          showAlert: showSimIssueAlert,
          setShowAlert: setShowSimIssueAlert,
          devices: devices,
          filterFn: (d) => d.hasSimIssue,
          getIncidentsFn: (device) => device.simIssuePackets || [],
          icon: 'sim-card'
        })}

        {/* Data Issue Alert */}
        {stats.lowData > 0 && renderIncidentTable({
          title: 'Data Issue Incidents',
          showAlert: showDataIssueAlert,
          setShowAlert: setShowDataIssueAlert,
          devices: devices,
          filterFn: (d) => d.hasDataIssue,
          getIncidentsFn: (device) => device.dataIssuePackets || [],
          icon: 'database'
        })}

        {/* GPS Issue Alert */}
        {stats.gpsUplinkIssues > 0 && renderIncidentTable({
          title: 'GPS Issue Incidents',
          showAlert: showGpsIssueAlert,
          setShowAlert: setShowGpsIssueAlert,
          devices: devices,
          filterFn: (d) => d.hasGpsIssue,
          getIncidentsFn: (device) => device.gpsIssuePackets || [],
          icon: 'satellite-dish'
        })}

        {/* Low Battery Alert */}
        {stats.batteryHealth > 0 && renderIncidentTable({
          title: 'Low Battery Incidents',
          showAlert: showLowBatteryAlert,
          setShowAlert: setShowLowBatteryAlert,
          devices: devices,
          filterFn: (d) => d.hasLowBattery,
          getIncidentsFn: (device) => device.lowBatteryPackets || [],
          icon: 'battery-quarter'
        })}
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

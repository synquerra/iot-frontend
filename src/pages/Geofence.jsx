import React, { useState, useEffect, useMemo } from "react";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { useUserContext } from "../contexts/UserContext";
import { useGeofenceCommand } from "../hooks/useGeofenceCommand";
import { useGeofenceValidation } from "../hooks/useGeofenceValidation";
import { useGeofenceList } from "../hooks/useGeofenceList";
import { useDeviceFilter } from "../hooks/useDeviceFilter";
import { listDevicesFiltered } from "../utils/deviceFiltered";
import CustomPolygonInput from "../components/CustomPolygonInput";
import GeofenceMap from "../components/GeofenceMap";
import GeofenceDeleteDialog from "../components/GeofenceDeleteDialog";
import ValidationError from "../components/ValidationError";
import ValidationWarning from "../components/ValidationWarning";

export default function Geofence() {
  const { imeis, isAdmin } = useUserContext();
  
  // Device filtering hook
  const { filterDevices } = useDeviceFilter();
  
  // State for devices list
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileName, setProfileName] = useState("Home");
  const [imei, setImei] = useState("");
  const [showMap, setShowMap] = useState(true); // Toggle between map and manual input
  const [editingGeofence, setEditingGeofence] = useState(null); // Geofence being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Geofence to delete
  const [deleteLoading, setDeleteLoading] = useState(false); // Delete operation loading
  const [customPoints, setCustomPoints] = useState([]);

  const { setGeofence, loading: commandLoading, error: commandError, response: commandResponse } = useGeofenceCommand();

  // Fetch geofences from API
  const { geofences, loading: geofencesLoading, error: geofencesError, count, refresh } = useGeofenceList(imei);

  // Use validation hook for real-time validation
  const { isValid, errors, warnings } = useGeofenceValidation(customPoints);

  /**
   * Effect: Fetch devices list on mount
   */
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      try {
        const result = await listDevicesFiltered();
        const devicesList = result.full || result.devices || [];
        setDevices(devicesList);
        
        // Auto-select device for parent with single device
        if (!isAdmin() && devicesList.length === 1) {
          setImei(devicesList[0].imei);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };
    
    fetchDevices();
  }, [isAdmin]);

  // Apply device filtering
  const filteredDevices = useMemo(() => {
    return filterDevices(devices);
  }, [devices, filterDevices]);

  // Determine if device filter should be shown
  // Show filter if: ADMIN (always) OR Parent with 2+ devices
  const shouldShowDeviceFilter = useMemo(() => {
    if (isAdmin()) {
      return true; // Always show for ADMIN
    }
    // For PARENTS, only show if they have 2 or more devices
    return filteredDevices.length >= 2;
  }, [isAdmin, filteredDevices.length]);

  // Debug logging for geofences
  useEffect(() => {
    console.log('[Geofence] Geofences updated:', geofences);
    console.log('[Geofence] Count:', count);
    console.log('[Geofence] Loading:', geofencesLoading);
    console.log('[Geofence] Error:', geofencesError);
  }, [geofences, count, geofencesLoading, geofencesError]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "🗺️" },
    { id: "create", label: "Create", icon: "➕" },
    { id: "alerts", label: "Alerts", icon: "🚨" }
  ];

  const activeGeofences = geofences.filter(g => g.status === "active").length;
  const inactiveGeofences = geofences.filter(g => g.status === "inactive").length;

  // Computed value for edit mode
  const isEditMode = editingGeofence !== null;

  // Handle edit button click
  const handleEdit = (geofence) => {
    setEditingGeofence(geofence);
    setProfileName(geofence.name);
    setImei(imei); // Keep current IMEI or load from geofence if stored
    // Parse coordinates from geofence (assuming they're stored)
    // For now, using default points as placeholder
    setCustomPoints([
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 },
      { latitude: 23.301700, longitude: 85.327200 },
      { latitude: 23.301624, longitude: 85.327065 }
    ]);
    setActiveTab("create");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingGeofence(null);
    setProfileName("Home");
    setCustomPoints([]);
  };

  // Handle view on map
  const handleViewOnMap = (geofence) => {
    if (!geofence.coordinates || geofence.coordinates.length === 0) {
      alert('No coordinates available for this geofence');
      return;
    }

    // Calculate center point of the polygon
    const latSum = geofence.coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
    const lngSum = geofence.coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
    const centerLat = latSum / geofence.coordinates.length;
    const centerLng = lngSum / geofence.coordinates.length;

    // Create polygon path for Google Maps
    const pathString = geofence.coordinates
      .map(coord => `${coord.latitude},${coord.longitude}`)
      .join('|');

    // Google Maps URL with polygon overlay
    // Format: https://www.google.com/maps/dir/?api=1&destination=lat,lng&travelmode=driving
    // For polygon, we'll use the center and add a custom path parameter
    const googleMapsUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=16`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
  };

  // Handle delete button click
  const handleDeleteClick = (geofence) => {
    setShowDeleteConfirm(geofence);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      // TODO: Call DELETE_GEOFENCE API when available
      // await deleteGeofence(imei, showDeleteConfirm.geofence_number);
      
      // For now, just remove from local state
      const updatedGeofences = geofences.filter(g => g.id !== showDeleteConfirm.id);
      setGeofences(updatedGeofences);
      
      alert(`✓ Geofence "${showDeleteConfirm.name}" deleted successfully!`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete geofence:', error);
      
      // Distinguish between error types
      let errorMessage = '';
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = `Network error: Unable to reach the server. Please check your connection and try again.`;
      } else if (error.response?.status === 404) {
        errorMessage = `Geofence not found on device`;
      } else if (error.response?.status === 401) {
        errorMessage = `Authentication error: Please log in again`;
      } else if (error.response?.status === 500) {
        errorMessage = `Server error: Please try again later`;
      } else {
        errorMessage = `Failed to delete geofence: ${error.message}`;
      }
      
      alert(`✗ ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let geofenceCoordinates = [...customPoints];
      
      // Auto-close the polygon if needed
      const first = geofenceCoordinates[0];
      const last = geofenceCoordinates[geofenceCoordinates.length - 1];
      if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
        geofenceCoordinates.push({ ...first });
      }

      await setGeofence(imei, {
        geofence_number: "GEO1",
        geofence_id: profileName,
        coordinates: geofenceCoordinates
      });

      if (isEditMode) {
        // Update existing geofence
        alert(`✓ Geofence "${profileName}" updated successfully!`);
        handleCancelEdit();
      } else {
        // Create new geofence
        alert(`✓ Geofence "${profileName}" created successfully!`);
      }
      
      // Refresh the geofence list
      refresh();
      
    } catch (error) {
      console.error('Failed to set geofence:', error);
      
      // Distinguish between error types
      let errorMessage = '';
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = `Network error: Unable to reach the server. Please check your connection and try again.`;
      } else if (error.message?.includes('validation')) {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error.response?.status === 400) {
        errorMessage = `Invalid request: ${error.response?.data?.message || 'Please check your input'}`;
      } else if (error.response?.status === 401) {
        errorMessage = `Authentication error: Please log in again`;
      } else if (error.response?.status === 500) {
        errorMessage = `Server error: Please try again later`;
      } else {
        errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} geofence: ${error.message}`;
      }
      
      alert(`✗ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      {/* AdminLTE Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Geofence Management
              </h1>
              <p className="text-gray-600">
                Create, manage, and monitor geographic boundaries for your devices
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-gray-500 text-sm">Active Zones</div>
                <div className="text-green-600 text-xl font-bold">{activeGeofences}/{geofences.length}</div>
                <div className="text-gray-500 text-xs">Geofences</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards - AdminLTE Small Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 md:mb-6">
        {/* Total Geofences */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-4">
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-sm font-medium mt-1">Total Geofences</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-map-marked-alt text-5xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-sm">
            Configured
          </div>
        </div>

        {/* Active Zones */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#28a745] to-[#218838] text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-4">
            <div className="text-3xl font-bold">{activeGeofences}</div>
            <div className="text-sm font-medium mt-1">Active Zones</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-check-circle text-5xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-sm">
            Monitoring
          </div>
        </div>

        {/* Inactive Zones */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-4">
            <div className="text-3xl font-bold">{inactiveGeofences}</div>
            <div className="text-sm font-medium mt-1">Inactive Zones</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-ban text-5xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-sm">
            Disabled
          </div>
        </div>

        {/* Alerts Today */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#dc3545] to-[#c82333] text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-4">
            <div className="text-3xl font-bold">12</div>
            <div className="text-sm font-medium mt-1">Alerts Today</div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <i className="fas fa-bell text-5xl"></i>
          </div>
          <div className="bg-black/20 px-4 py-2 text-center text-sm">
            Triggered (Dummy)
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Device Selector - Show based on role and device count */}
          {shouldShowDeviceFilter && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                <label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <i className="fas fa-mobile-alt text-blue-600"></i>
                  Select Device to View Geofences
                </label>
                <select
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  style={{ background: 'white', color: '#1f2937' }}
                >
                  <option value="" style={{ background: 'white', color: '#1f2937' }}>
                    Select a device...
                  </option>
                  {filteredDevices.map((device) => (
                    <option key={device.imei} value={device.imei} style={{ background: 'white', color: '#1f2937' }}>
                      {device.imei}
                    </option>
                  ))}
                </select>
                {!imei && (
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Please select a device to view its geofences
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No Devices Warning */}
          {filteredDevices.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-3 text-yellow-800">
                <i className="fas fa-exclamation-triangle text-2xl text-yellow-600"></i>
                <div>
                  <p className="font-semibold text-base">No devices assigned</p>
                  <p className="text-sm text-yellow-700">Please contact your administrator to assign devices to your account.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-map-marked-alt text-blue-600"></i>
                Geofence List ({count})
                {!shouldShowDeviceFilter && imei && (
                  <span className="text-xs text-gray-500 font-normal">
                    - {imei}
                  </span>
                )}
              </h3>
              <button
                onClick={refresh}
                disabled={geofencesLoading || !imei}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <i className={cn("fas fa-redo", geofencesLoading && "fa-spin")}></i>
                Refresh
              </button>
            </div>

            <div className="p-6">{/* Loading State */}
              {geofencesLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loading type="spinner" size="lg" color="blue" />
                  <span className="ml-3 text-gray-600 font-medium">Loading geofences...</span>
                </div>
              )}

              {/* Error State */}
              {geofencesError && !geofencesLoading && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <i className="fas fa-exclamation-circle text-xl"></i>
                    <span className="font-medium">Failed to load geofences: {geofencesError.message}</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!geofencesLoading && !geofencesError && geofences.length === 0 && imei && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">No geofences found</p>
                  <p className="text-gray-500 text-sm">Create your first geofence to get started</p>
                </div>
              )}

              {/* No IMEI Selected State */}
              {!geofencesLoading && !geofencesError && !imei && shouldShowDeviceFilter && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-mobile-alt text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">Select a device</p>
                  <p className="text-gray-500 text-sm">Choose a device from the dropdown above to view its geofences</p>
                </div>
              )}

              {/* Geofence List */}
              {!geofencesLoading && !geofencesError && geofences.length > 0 && (
                <div className="space-y-3">
                  {geofences.map((geofence) => (
                  <div 
                    key={geofence.id} 
                    className={cn(
                      "flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-lg border-2 transition-all duration-200 gap-4",
                      editingGeofence?.id === geofence.id
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        geofence.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      )}></div>
                      <div>
                        <div className="text-gray-800 font-semibold flex flex-wrap items-center gap-2">
                          {geofence.name}
                          {editingGeofence?.id === geofence.id && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                              Editing
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 text-sm">{geofence.coordinatesCount} points</div>
                        <div className="text-gray-500 text-xs font-mono">{geofence.geofence_number}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-gray-500 text-xs">Created</div>
                        <div className="text-gray-800 font-semibold text-sm">
                          {new Date(geofence.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold',
                        geofence.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      )}>
                        {geofence.status}
                      </div>
                      <button
                        onClick={() => handleViewOnMap(geofence)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <i className="fas fa-map-marked-alt"></i>
                        <span className="hidden sm:inline">View on Map</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      <button
                        onClick={() => handleEdit(geofence)}
                        disabled={true}
                        className="px-3 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(geofence)}
                        disabled={true}
                        className="px-3 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2"
                      >
                        <i className="fas fa-trash"></i>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "create" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className={cn("fas", isEditMode ? "fa-edit" : "fa-plus", "text-white")}></i>
                </div>
                {isEditMode ? 'Edit Geofence' : 'Create New Geofence'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {isEditMode ? 'Update geofence boundaries and settings' : 'Define geographic boundaries for your device'}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Device IMEI Selection */}
                <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-mobile-alt text-white text-xs"></i>
                    </div>
                    Device IMEI
                    <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Required</span>
                  </label>
                  {imei ? (
                    // If device is already selected, show it as disabled
                    <input
                      type="text"
                      value={imei}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                    />
                  ) : shouldShowDeviceFilter ? (
                    // If no device selected and filter should show, show dropdown
                    <select
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      style={{ background: 'white', color: '#1f2937' }}
                    >
                      <option value="" style={{ background: 'white', color: '#1f2937' }}>
                        Select a device...
                      </option>
                      {filteredDevices.map((device) => (
                        <option key={device.imei} value={device.imei} style={{ background: 'white', color: '#1f2937' }}>
                          {device.imei}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // If no device selected and filter shouldn't show (single device parent)
                    <input
                      type="text"
                      value={imei}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                    />
                  )}
                  {imei.length > 0 && imei.length !== 15 && (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      IMEI should be 15 digits
                    </p>
                  )}
                  {!imei && (
                    <p className="text-gray-600 text-xs flex items-center gap-1">
                      <i className="fas fa-info-circle text-blue-500"></i>
                      {shouldShowDeviceFilter ? 'Select a device to create geofence for' : 'Please select a device in Overview tab first'}
                    </p>
                  )}
                </div>

                {/* Geofence Name */}
                <div className="space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-tag text-white text-xs"></i>
                    </div>
                    Geofence Name
                    <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Required</span>
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm",
                      profileName.length > 0 ? "border-green-200" : "border-red-300"
                    )}
                    style={{ color: '#1f2937', backgroundColor: 'white' }}
                    placeholder="Enter geofence name"
                  />
                  {profileName.length === 0 && (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      Geofence name is required
                    </p>
                  )}
                </div>

                {/* Toggle between Map and Manual Input */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-map text-purple-600"></i>
                      Input Method
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowMap(true)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                          showMap
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <i className="fas fa-map-marked-alt"></i>
                        Map
                      </button>
                      <button
                        onClick={() => setShowMap(false)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                          !showMap
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <i className="fas fa-edit"></i>
                        Manual
                      </button>
                    </div>
                  </div>

                  {/* Map or Manual Input */}
                  {showMap ? (
                    <div>
                      <label className="text-gray-700 font-semibold text-sm block mb-3">
                        Draw Geofence on Map
                      </label>
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                        <GeofenceMap
                          coordinates={customPoints}
                          onCoordinatesChange={setCustomPoints}
                          editable={true}
                          center={{ lat: 23.3441, lng: 85.3096 }}
                          zoom={13}
                        />
                      </div>
                      <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Click on the map to add points. Drag markers to move them. Click markers to delete them.
                      </p>
                    </div>
                  ) : (
                    <CustomPolygonInput points={customPoints} onPointsChange={setCustomPoints} />
                  )}
                </div>

                {/* Validation Errors */}
                <ValidationError errors={errors} />

                {/* Validation Warnings */}
                <ValidationWarning warnings={warnings} />

                {commandError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <i className="fas fa-exclamation-circle text-xl"></i>
                      <div>
                        <h4 className="font-semibold mb-1">Error</h4>
                        <div className="text-sm">{commandError.message}</div>
                      </div>
                    </div>
                  </div>
                )}

                {commandResponse && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <i className="fas fa-check-circle text-xl"></i>
                      <div>
                        <h4 className="font-semibold mb-1">Success</h4>
                        <div className="text-sm">Geofence set successfully!</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-white"></i>
                </div>
                Recent Alerts
              </h3>
              <p className="text-red-100 text-sm mt-1">Monitor geofence entry and exit events (Dummy Data)</p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {[
                  { id: 1, type: "Entry", zone: "Home", device: "Device-001", time: "2 min ago" },
                  { id: 2, type: "Exit", zone: "Office", device: "Device-002", time: "15 min ago" },
                  { id: 3, type: "Entry", zone: "School", device: "Device-003", time: "1 hour ago" },
                  { id: 4, type: "Exit", zone: "Mall", device: "Device-001", time: "2 hours ago" }
                ].map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-red-300 hover:shadow-sm transition-all duration-200 gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                        alert.type === 'Entry' ? 'bg-green-100' : 'bg-red-100'
                      )}>
                        <i className={cn(
                          'fas text-xl',
                          alert.type === 'Entry' ? 'fa-sign-in-alt text-green-600' : 'fa-sign-out-alt text-red-600'
                        )}></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-800 font-semibold flex flex-wrap items-center gap-2">
                          {alert.type} - {alert.zone}
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded font-semibold',
                            alert.type === 'Entry' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          )}>
                            {alert.type}
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                          <i className="fas fa-mobile-alt text-gray-400"></i>
                          {alert.device}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-gray-500 text-xs">Triggered</div>
                      <div className="text-gray-800 font-semibold text-sm">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Only show in Create tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={loading || commandLoading || !isValid}
              className={cn(
                "w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 sm:min-w-[180px]",
                "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                "shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              )}
            >
              {(loading || commandLoading) ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  {isEditMode ? 'Update Geofence' : 'Save Geofence'}
                </>
              )}
            </button>
            {isEditMode && (
              <button
                onClick={handleCancelEdit}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 sm:min-w-[180px]"
              >
                <i className="fas fa-times"></i>
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <GeofenceDeleteDialog
        geofence={showDeleteConfirm}
        isOpen={showDeleteConfirm !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  );
}

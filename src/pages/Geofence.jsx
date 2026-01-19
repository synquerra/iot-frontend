import React, { useState, useEffect } from "react";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { useUserContext } from "../contexts/UserContext";
import { useGeofenceCommand } from "../hooks/useGeofenceCommand";
import { useGeofenceValidation } from "../hooks/useGeofenceValidation";
import { useGeofenceList } from "../hooks/useGeofenceList";
import CustomPolygonInput from "../components/CustomPolygonInput";
import GeofenceMap from "../components/GeofenceMap";
import GeofenceDeleteDialog from "../components/GeofenceDeleteDialog";
import ValidationError from "../components/ValidationError";
import ValidationWarning from "../components/ValidationWarning";

export default function Geofence() {
  const { imeis } = useUserContext();
  
  // IMEI mode detection logic (same as Settings.jsx)
  const validImeis = (imeis || []).filter(imei => imei && imei.trim() !== '');
  const imeiCount = validImeis.length;
  const hasNoDevices = imeiCount === 0;
  const hasSingleDevice = imeiCount === 1;
  const hasMultipleDevices = imeiCount > 1;
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileName, setProfileName] = useState("Home");
  const [imei, setImei] = useState("");
  const [showMap, setShowMap] = useState(true); // Toggle between map and manual input
  const [editingGeofence, setEditingGeofence] = useState(null); // Geofence being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Geofence to delete
  const [deleteLoading, setDeleteLoading] = useState(false); // Delete operation loading
  const [customPoints, setCustomPoints] = useState([
    { latitude: 23.301624, longitude: 85.327065 },
    { latitude: 23.301700, longitude: 85.327100 },
    { latitude: 23.301750, longitude: 85.327150 },
    { latitude: 23.301700, longitude: 85.327200 },
    { latitude: 23.301624, longitude: 85.327065 }
  ]);

  const { setGeofence, loading: commandLoading, error: commandError, response: commandResponse } = useGeofenceCommand();

  // Fetch geofences from API
  const { geofences, loading: geofencesLoading, error: geofencesError, count, refresh } = useGeofenceList(imei);

  // Use validation hook for real-time validation
  const { isValid, errors, warnings } = useGeofenceValidation(customPoints);

  // Auto-populate IMEI for single device users
  useEffect(() => {
    console.log('[Geofence] IMEI useEffect triggered');
    console.log('[Geofence] hasSingleDevice:', hasSingleDevice);
    console.log('[Geofence] validImeis:', validImeis);
    console.log('[Geofence] current imei:', imei);
    
    if (hasSingleDevice && validImeis.length > 0 && !imei) {
      console.log('[Geofence] Setting IMEI to:', validImeis[0]);
      setImei(validImeis[0]);
    }
  }, [hasSingleDevice, validImeis, imei]);

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
    setCustomPoints([
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 },
      { latitude: 23.301700, longitude: 85.327200 },
      { latitude: 23.301624, longitude: 85.327065 }
    ]);
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                Geofence Management
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-2xl">
                Create, manage, and monitor geographic boundaries for your devices
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Active Zones</div>
                <div className="text-green-300 text-xl font-bold">{activeGeofences}/{geofences.length}</div>
                <div className="text-blue-200/70 text-xs">Geofences</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card variant="glass" colorScheme="slate" padding="sm" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-blue-200/80 text-sm font-medium mb-1">Total Geofences</div>
                <div className="text-white text-3xl font-bold mb-2">{count}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-200/70 text-xs">Configured</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-green-200/80 text-sm font-medium mb-1">Active Zones</div>
                <div className="text-white text-3xl font-bold mb-2">{activeGeofences}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200/70 text-xs">Monitoring</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="text-amber-200/80 text-sm font-medium mb-1">Inactive Zones</div>
                <div className="text-white text-3xl font-bold mb-2">{inactiveGeofences}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Disabled</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-purple-200/80 text-sm font-medium mb-1">Alerts Today(Dummy)</div>
                <div className="text-white text-3xl font-bold mb-2">12</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200/70 text-xs">Triggered</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 12.344l1.414 1.414L7.5 11.5M2.088 4.601l1.414 1.414L5.25 3.75M12.344 4.343l1.414-1.414L11.5 1.5" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* IMEI Selector for Multiple Devices */}
          {hasMultipleDevices && (
            <Card variant="glass" colorScheme="blue" padding="lg">
              <Card.Content>
                <div className="space-y-3">
                  <label className="text-blue-200/80 text-sm font-medium block">
                    Select Device to View Geofences
                  </label>
                  <select
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white",
                      "focus:bg-white/20 focus:outline-none transition-all duration-300",
                      "border-white/30 focus:border-blue-400/60"
                    )}
                  >
                    <option value="" className="bg-gray-800 text-white">
                      Select a device...
                    </option>
                    {validImeis.map((imeiOption) => (
                      <option key={imeiOption} value={imeiOption} className="bg-gray-800 text-white">
                        {imeiOption}
                      </option>
                    ))}
                  </select>
                  {!imei && (
                    <p className="text-blue-200/70 text-xs">
                      Please select a device to view its geofences
                    </p>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* No Devices Warning */}
          {hasNoDevices && (
            <Card variant="glass" colorScheme="amber" padding="lg">
              <Card.Content>
                <div className="flex items-center gap-3 text-amber-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium">No devices assigned</p>
                    <p className="text-sm text-amber-200/70">Please contact your administrator to assign devices to your account.</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Geofence List ({count})
                  {hasSingleDevice && (
                    <span className="text-xs text-blue-300/70 font-normal">
                      - {validImeis[0]}
                    </span>
                  )}
                </h3>
                <button
                  onClick={refresh}
                  disabled={geofencesLoading || !imei}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className={cn("w-4 h-4", geofencesLoading && "animate-spin")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Loading State */}
              {geofencesLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loading type="spinner" size="lg" color="blue" />
                  <span className="ml-3 text-blue-300">Loading geofences...</span>
                </div>
              )}

              {/* Error State */}
              {geofencesError && !geofencesLoading && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Failed to load geofences: {geofencesError.message}</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!geofencesLoading && !geofencesError && geofences.length === 0 && imei && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-white/70 text-lg mb-2">No geofences found</p>
                  <p className="text-white/50 text-sm">Create your first geofence to get started</p>
                </div>
              )}

              {/* No IMEI Selected State */}
              {!geofencesLoading && !geofencesError && !imei && hasMultipleDevices && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/70 text-lg mb-2">Select a device</p>
                  <p className="text-white/50 text-sm">Choose a device from the dropdown above to view its geofences</p>
                </div>
              )}

              {/* Geofence List */}
              {!geofencesLoading && !geofencesError && geofences.length > 0 && (
                <div className="space-y-3">
                  {geofences.map((geofence) => (
                  <div 
                    key={geofence.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors duration-200",
                      editingGeofence?.id === geofence.id
                        ? "bg-blue-500/20 border-blue-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        geofence.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                      )}></div>
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {geofence.name}
                          {editingGeofence?.id === geofence.id && (
                            <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                              Editing
                            </span>
                          )}
                        </div>
                        <div className="text-white/70 text-sm">{geofence.coordinatesCount} points</div>
                        <div className="text-white/50 text-xs">{geofence.geofence_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white/70 text-xs">Created</div>
                        <div className="text-white font-medium text-sm">
                          {new Date(geofence.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        geofence.status === 'active' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-300'
                      )}>
                        {geofence.status}
                      </div>
                      <button
                        onClick={() => handleViewOnMap(geofence)}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View on Map
                      </button>
                      <button
                        onClick={() => handleEdit(geofence)}
                        disabled={true}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-300/50 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-1 opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(geofence)}
                        disabled={true}
                        className="px-3 py-1.5 bg-red-500/10 text-red-300/50 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-1 opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "create" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="blue" padding="lg">
            <Card.Content>
              <h3 className="text-blue-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditMode ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
                {isEditMode ? 'Edit Geofence' : 'Create New Geofence'}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-blue-200/80 text-sm font-medium block mb-3">
                    Device IMEI
                  </label>
                  {hasSingleDevice ? (
                    <input
                      type="text"
                      value={validImeis[0]}
                      readOnly
                      disabled
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border text-white",
                        "border-white/20 cursor-not-allowed opacity-70",
                        "focus:outline-none"
                      )}
                      aria-label="Device IMEI (auto-filled)"
                    />
                  ) : hasMultipleDevices ? (
                    <select
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white",
                        "focus:bg-white/20 focus:outline-none transition-all duration-300",
                        imei.length === 0 || imei.length === 15
                          ? "border-white/30 focus:border-blue-400/60"
                          : "border-red-400/60 focus:border-red-400/80"
                      )}
                      aria-label="Select Device IMEI"
                    >
                      <option value="" className="bg-gray-800 text-white">
                        Select a device...
                      </option>
                      {validImeis.map((imeiOption) => (
                        <option key={imeiOption} value={imeiOption} className="bg-gray-800 text-white">
                          {imeiOption}
                        </option>
                      ))}
                    </select>
                  ) : hasNoDevices ? (
                    <>
                      <input
                        type="text"
                        value=""
                        readOnly
                        disabled
                        placeholder="No devices assigned"
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border text-white",
                          "border-white/20 cursor-not-allowed opacity-70 placeholder-white/50",
                          "focus:outline-none"
                        )}
                        aria-label="Device IMEI (no devices assigned)"
                      />
                      <p className="text-orange-200 text-sm font-medium mt-2">
                        No devices are assigned to your account. Please contact your administrator to assign devices.
                      </p>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      className={cn(
                        "w-full bg-white/10 border rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:outline-none",
                        imei.length === 0 || imei.length === 15
                          ? "border-white/20 focus:border-blue-400/60"
                          : "border-red-500/50 focus:border-red-400/60"
                      )}
                      placeholder="Enter device IMEI"
                    />
                  )}
                  {imei.length > 0 && imei.length !== 15 && !hasSingleDevice && !hasNoDevices && (
                    <p className="text-red-300 text-xs mt-1">IMEI should be 15 digits</p>
                  )}
                </div>

                <div>
                  <label className="text-blue-200/80 text-sm font-medium block mb-3">
                    Geofence Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={cn(
                      "w-full bg-white/10 border rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:outline-none",
                      profileName.length > 0
                        ? "border-white/20 focus:border-blue-400/60"
                        : "border-red-500/50 focus:border-red-400/60"
                    )}
                    placeholder="Enter geofence name"
                  />
                  {profileName.length === 0 && (
                    <p className="text-red-300 text-xs mt-1">Geofence name is required</p>
                  )}
                </div>

                {/* Toggle between Map and Manual Input */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
                  <span className="text-blue-200/80 text-sm font-medium">Input Method</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMap(true)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        showMap
                          ? 'bg-blue-500/80 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                    >
                      🗺️ Map
                    </button>
                    <button
                      onClick={() => setShowMap(false)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        !showMap
                          ? 'bg-blue-500/80 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                    >
                      ✏️ Manual
                    </button>
                  </div>
                </div>

                {/* Map or Manual Input */}
                {showMap ? (
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium block mb-3">
                      Draw Geofence on Map
                    </label>
                    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                      <GeofenceMap
                        coordinates={customPoints}
                        onCoordinatesChange={setCustomPoints}
                        editable={true}
                        center={{ lat: 23.3441, lng: 85.3096 }}
                        zoom={13}
                      />
                    </div>
                    <p className="text-blue-200/60 text-xs mt-2">
                      Click on the map to add points. Drag markers to move them. Click markers to delete them.
                    </p>
                  </div>
                ) : (
                  <CustomPolygonInput points={customPoints} onPointsChange={setCustomPoints} />
                )}

                

                {/* Validation Errors */}
                <ValidationError errors={errors} />

                {/* Validation Warnings */}
                <ValidationWarning warnings={warnings} />

                {commandError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-300 font-medium mb-2">Error</h4>
                    <div className="text-red-200 text-sm">{commandError.message}</div>
                  </div>
                )}

                {commandResponse && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-medium mb-2">Success</h4>
                    <div className="text-green-200 text-sm">Geofence set successfully!</div>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Recent Alerts(Dummy)
              </h3>
              <div className="space-y-3">
                {[
                  { id: 1, type: "Entry", zone: "Home", device: "Device-001", time: "2 min ago" },
                  { id: 2, type: "Exit", zone: "Office", device: "Device-002", time: "15 min ago" },
                  { id: 3, type: "Entry", zone: "School", device: "Device-003", time: "1 hour ago" },
                  { id: 4, type: "Exit", zone: "Mall", device: "Device-001", time: "2 hours ago" }
                ].map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        alert.type === 'Entry' ? 'bg-green-500/20' : 'bg-red-500/20'
                      )}>
                        <svg className={cn(
                          'w-4 h-4',
                          alert.type === 'Entry' ? 'text-green-400' : 'text-red-400'
                        )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={alert.type === 'Entry' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">{alert.type} - {alert.zone}</div>
                        <div className="text-white/70 text-sm">{alert.device}</div>
                      </div>
                    </div>
                    <div className="text-white/70 text-sm">{alert.time}</div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Action Buttons - Only show in Create tab */}
      {activeTab === "create" && (
        <Card variant="glass" colorScheme="slate" padding="lg">
          <Card.Content>
            <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="glass"
              colorScheme="green"
              size="lg"
              onClick={handleSave}
              disabled={loading || commandLoading || !isValid}
              className="min-w-[150px]"
            >
              {(loading || commandLoading) ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? 'Update Geofence' : 'Save Geofence'}
                </>
              )}
            </Button>
            {isEditMode && (
              <Button
                variant="outline"
                colorScheme="red"
                size="lg"
                onClick={handleCancelEdit}
                className="min-w-[150px]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>
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

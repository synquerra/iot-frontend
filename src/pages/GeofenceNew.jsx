import React, { useState } from "react";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { useGeofenceCommand, createCircularGeofence } from "../hooks/useGeofenceCommand";
import CustomPolygonInput from "../components/CustomPolygonInput";

export default function Geofence() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileName, setProfileName] = useState("Home");
  const [coordinates, setCoordinates] = useState({ x: 23.301624, y: 85.327065 });
  const [radius, setRadius] = useState(100);
  const [imei, setImei] = useState("862942074957887");
  const [geofenceMode, setGeofenceMode] = useState("circular");
  const [customPoints, setCustomPoints] = useState([
    { latitude: 23.301624, longitude: 85.327065 },
    { latitude: 23.301700, longitude: 85.327100 },
    { latitude: 23.301750, longitude: 85.327150 },
    { latitude: 23.301700, longitude: 85.327200 },
    { latitude: 23.301624, longitude: 85.327065 }
  ]);
  const [geofences, setGeofences] = useState([
    { id: 1, name: "Home", status: "active", coordinates: "62.531135, 63.513135", radius: 100 },
    { id: 2, name: "Office", status: "active", coordinates: "62.541135, 63.523135", radius: 50 },
    { id: 3, name: "School", status: "inactive", coordinates: "62.521135, 63.503135", radius: 75 },
    { id: 4, name: "Mall", status: "active", coordinates: "62.561135, 63.543135", radius: 200 },
    { id: 5, name: "Hospital", status: "inactive", coordinates: "62.511135, 63.493135", radius: 150 }
  ]);

  const { setGeofence, loading: commandLoading, error: commandError, response: commandResponse } = useGeofenceCommand();

  const tabs = [
    { id: "overview", label: "Overview", icon: "🗺️" },
    { id: "create", label: "Create", icon: "➕" },
    { id: "alerts", label: "Alerts", icon: "🚨" }
  ];

  const activeGeofences = geofences.filter(g => g.status === "active").length;
  const inactiveGeofences = geofences.filter(g => g.status === "inactive").length;

  const handleSave = async () => {
    setLoading(true);
    try {
      let geofenceCoordinates;
      
      if (geofenceMode === "circular") {
        geofenceCoordinates = createCircularGeofence(coordinates.x, coordinates.y, radius, 16);
      } else {
        geofenceCoordinates = [...customPoints];
        const first = geofenceCoordinates[0];
        const last = geofenceCoordinates[geofenceCoordinates.length - 1];
        if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
          geofenceCoordinates.push({ ...first });
        }
      }

      await setGeofence(imei, {
        geofence_number: "GEO1",
        geofence_id: profileName,
        coordinates: geofenceCoordinates
      });

      const newGeofence = {
        id: geofences.length + 1,
        name: profileName,
        status: "active",
        coordinates: geofenceMode === "circular" ? `${coordinates.x}, ${coordinates.y}` : `${customPoints.length} points`,
        radius: geofenceMode === "circular" ? radius : null
      };
      setGeofences([...geofences, newGeofence]);

      alert(`Geofence "${profileName}" set successfully!`);
    } catch (error) {
      console.error('Failed to set geofence:', error);
      alert(`Failed to set geofence: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-blue-200/80 text-sm font-medium mb-1">Total Geofences</div>
                <div className="text-white text-3xl font-bold mb-2">{geofences.length}</div>
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
                <div className="text-purple-200/80 text-sm font-medium mb-1">Alerts Today</div>
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

      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Geofence List
              </h3>
              <div className="space-y-3">
                {geofences.map((geofence) => (
                  <div key={geofence.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        geofence.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                      )}></div>
                      <div>
                        <div className="text-white font-medium">{geofence.name}</div>
                        <div className="text-white/70 text-sm">{geofence.coordinates}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white/70 text-xs">Radius</div>
                        <div className="text-white font-medium">{geofence.radius}m</div>
                      </div>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        geofence.status === 'active' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-300'
                      )}>
                        {geofence.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Geofence
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-blue-200/80 text-sm font-medium block mb-3">
                    Device IMEI
                  </label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    placeholder="Enter device IMEI"
                  />
                </div>

                <div>
                  <label className="text-blue-200/80 text-sm font-medium block mb-3">
                    Geofence Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    placeholder="Enter geofence name"
                  />
                </div>

                <div>
                  <label className="text-blue-200/80 text-sm font-medium block mb-3">
                    Geofence Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setGeofenceMode("circular")}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        geofenceMode === "circular"
                          ? 'bg-blue-500/80 text-white border-2 border-blue-400'
                          : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/15'
                      )}
                    >
                      🔵 Circular (Center + Radius)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeofenceMode("custom")}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        geofenceMode === "custom"
                          ? 'bg-purple-500/80 text-white border-2 border-purple-400'
                          : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/15'
                      )}
                    >
                      📐 Custom Polygon
                    </button>
                  </div>
                </div>

                {geofenceMode === "circular" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-blue-200/80 text-sm font-medium block mb-3">
                          Center Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={coordinates.x}
                          onChange={(e) => setCoordinates({...coordinates, x: parseFloat(e.target.value)})}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-blue-200/80 text-sm font-medium block mb-3">
                          Center Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={coordinates.y}
                          onChange={(e) => setCoordinates({...coordinates, y: parseFloat(e.target.value)})}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-blue-200/80 text-sm font-medium block mb-3">
                        Radius (meters)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {geofenceMode === "custom" && (
                  <CustomPolygonInput points={customPoints} onPointsChange={setCustomPoints} />
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Current Configuration</h4>
                  <div className="text-blue-200 text-sm space-y-1">
                    <div><span className="font-semibold">IMEI:</span> {imei}</div>
                    <div><span className="font-semibold">Name:</span> {profileName}</div>
                    <div><span className="font-semibold">Type:</span> {geofenceMode === "circular" ? "Circular" : "Custom Polygon"}</div>
                    {geofenceMode === "circular" ? (
                      <>
                        <div><span className="font-semibold">Center:</span> {coordinates.x.toFixed(6)}, {coordinates.y.toFixed(6)}</div>
                        <div><span className="font-semibold">Radius:</span> {radius}m</div>
                      </>
                    ) : (
                      <div><span className="font-semibold">Points:</span> {customPoints.length} coordinates</div>
                    )}
                  </div>
                </div>

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
                Recent Alerts
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

      <Card variant="glass" colorScheme="slate" padding="lg">
        <Card.Content>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="glass"
              colorScheme="green"
              size="lg"
              onClick={handleSave}
              disabled={loading || commandLoading}
              className="min-w-[150px]"
            >
              {(loading || commandLoading) ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Geofence
                </>
              )}
            </Button>
            <Button
              variant="outline"
              colorScheme="blue"
              size="lg"
              className="min-w-[150px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View on Map
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

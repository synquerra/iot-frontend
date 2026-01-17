// src/components/DetailedJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Detailed Journey Map - End-to-End Street View
 * 
 * Features:
 * - Complete journey visualization with all waypoints
 * - Street-level detail with high zoom
 * - Journey statistics (distance, duration, stops)
 * - Waypoint markers with timestamps
 * - Route segments with speed indicators
 * - Interactive journey exploration
 */

const DetailedJourneyMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 20.5937, lng: 78.9629 },
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showAllWaypoints, setShowAllWaypoints] = useState(true);
  const [journeyStats, setJourneyStats] = useState(null);

  // Load Leaflet
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Calculate journey statistics
  const calculateJourneyStats = (pathData) => {
    if (pathData.length < 2) return null;

    let totalDistance = 0;
    let stops = 0;
    const speeds = [];

    for (let i = 1; i < pathData.length; i++) {
      const lat1 = pathData[i - 1].lat;
      const lon1 = pathData[i - 1].lng;
      const lat2 = pathData[i].lat;
      const lon2 = pathData[i].lng;
      
      // Haversine formula for distance
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      totalDistance += distance;

      // Track speeds
      if (pathData[i].speed !== undefined) {
        speeds.push(Number(pathData[i].speed));
        if (Number(pathData[i].speed) === 0) stops++;
      }
    }

    // Calculate duration
    let duration = null;
    if (pathData[0].time && pathData[pathData.length - 1].time) {
      const start = new Date(pathData[0].time);
      const end = new Date(pathData[pathData.length - 1].time);
      duration = (end - start) / 1000 / 60; // minutes
    }

    const avgSpeed = speeds.length > 0 
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
      : 0;

    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

    return {
      totalDistance: totalDistance.toFixed(2),
      duration: duration ? Math.round(duration) : null,
      waypoints: pathData.length,
      stops,
      avgSpeed: avgSpeed.toFixed(1),
      maxSpeed: maxSpeed.toFixed(1),
    };
  };

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    let center = [defaultCenter.lat, defaultCenter.lng];
    let zoom = 13;

    if (path.length > 0) {
      center = [path[0].lat, path[0].lng];
      zoom = 16; // Higher zoom for street-level detail
    }

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 3,
      maxZoom: 19,
    });

    // High-detail street map with labels
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, defaultCenter]);

  // Render journey on map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || path.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    // Calculate stats
    const stats = calculateJourneyStats(path);
    setJourneyStats(stats);

    // Create route polyline with color gradient based on speed
    const routeCoords = path.map(p => [p.lat, p.lng]);
    
    // Main route line
    polylineRef.current = L.polyline(routeCoords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.8,
      smoothFactor: 1,
    }).addTo(map);

    // Add speed-based colored segments
    for (let i = 1; i < path.length; i++) {
      const speed = Number(path[i].speed || 0);
      let color = '#9ca3af'; // gray for no speed data
      
      if (speed > 60) color = '#ef4444'; // red for fast
      else if (speed > 30) color = '#f59e0b'; // orange for moderate
      else if (speed > 5) color = '#22c55e'; // green for slow
      else if (speed > 0) color = '#3b82f6'; // blue for very slow
      
      L.polyline(
        [[path[i-1].lat, path[i-1].lng], [path[i].lat, path[i].lng]],
        { color, weight: 4, opacity: 0.7 }
      ).addTo(map);
    }

    // Start marker (green)
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

    const startMarker = L.marker([path[0].lat, path[0].lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #22c55e;">
            🚀 Journey Start
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            ${path[0].time || 'No timestamp'}
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #9ca3af;">
            ${path[0].lat.toFixed(6)}, ${path[0].lng.toFixed(6)}
          </div>
        </div>
      `);
    markersRef.current.push(startMarker);

    // End marker (red)
    const endIcon = L.divIcon({
      className: 'end-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

    const endMarker = L.marker([path[path.length - 1].lat, path[path.length - 1].lng], { icon: endIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #ef4444;">
            🏁 Journey End
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            ${path[path.length - 1].time || 'No timestamp'}
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #9ca3af;">
            ${path[path.length - 1].lat.toFixed(6)}, ${path[path.length - 1].lng.toFixed(6)}
          </div>
        </div>
      `);
    markersRef.current.push(endMarker);

    // Waypoint markers (show every nth point to avoid clutter)
    if (showAllWaypoints && path.length > 2) {
      const step = Math.max(1, Math.floor(path.length / 20)); // Show max 20 waypoints
      
      for (let i = 1; i < path.length - 1; i += step) {
        const point = path[i];
        const speed = Number(point.speed || 0);
        
        let markerColor = '#3b82f6';
        let speedLabel = 'Moving';
        
        if (speed === 0) {
          markerColor = '#6b7280';
          speedLabel = 'Stopped';
        } else if (speed > 60) {
          markerColor = '#ef4444';
          speedLabel = 'Fast';
        } else if (speed > 30) {
          markerColor = '#f59e0b';
          speedLabel = 'Moderate';
        } else if (speed > 5) {
          markerColor = '#22c55e';
          speedLabel = 'Slow';
        }

        const waypointIcon = L.divIcon({
          className: 'waypoint-marker',
          html: `
            <div style="
              background: ${markerColor};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const waypointMarker = L.marker([point.lat, point.lng], { icon: waypointIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px;">
                📍 Waypoint ${i + 1}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                ${point.time || 'No timestamp'}
              </div>
              <div style="font-size: 12px; margin-bottom: 4px;">
                Speed: <span style="font-weight: 600; color: ${markerColor};">${speed} km/h</span>
                <span style="color: #9ca3af; margin-left: 4px;">(${speedLabel})</span>
              </div>
              <div style="font-size: 11px; font-family: monospace; color: #9ca3af;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
              </div>
            </div>
          `);
        
        markersRef.current.push(waypointMarker);
      }
    }

    // Fit map to show entire journey
    map.fitBounds(routeCoords, { padding: [60, 60] });

  }, [mapReady, path, showAllWaypoints]);

  return (
    <div className={cn('relative w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-slate-100', className)}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />

      {/* Loading */}
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading detailed map...</div>
          </div>
        </div>
      )}

      {/* Journey Statistics Panel */}
      {mapReady && journeyStats && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">📊 Journey Details</h3>
            <button
              onClick={() => setShowAllWaypoints(!showAllWaypoints)}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs font-semibold text-blue-700 transition-colors"
            >
              {showAllWaypoints ? 'Hide' : 'Show'} Waypoints
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">Distance</div>
              <div className="text-lg font-bold text-blue-900">{journeyStats.totalDistance} km</div>
            </div>
            
            {journeyStats.duration && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-1">Duration</div>
                <div className="text-lg font-bold text-purple-900">{journeyStats.duration} min</div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-green-600 font-medium mb-1">Waypoints</div>
              <div className="text-lg font-bold text-green-900">{journeyStats.waypoints}</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="text-xs text-orange-600 font-medium mb-1">Stops</div>
              <div className="text-lg font-bold text-orange-900">{journeyStats.stops}</div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
              <div className="text-xs text-cyan-600 font-medium mb-1">Avg Speed</div>
              <div className="text-lg font-bold text-cyan-900">{journeyStats.avgSpeed} km/h</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="text-xs text-red-600 font-medium mb-1">Max Speed</div>
              <div className="text-lg font-bold text-red-900">{journeyStats.maxSpeed} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Legend */}
      {mapReady && path.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4">
          <div className="text-xs font-bold text-gray-700 mb-3">Speed Legend</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span className="text-xs text-gray-600">Stopped (0 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Very Slow (1-5 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Slow (6-30 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">Moderate (31-60 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Fast (60+ km/h)</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mapReady && path.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-700 mb-2">
              No Journey Data
            </div>
            <div className="text-sm text-gray-500">
              Select a device to view its complete journey with detailed street-level tracking
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedJourneyMap;

// src/components/OlaUberStyleMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Ola/Uber Style Journey Map
 * 
 * Simple, clean map showing journey route with start/end markers
 * No complex calculations - just show the route beautifully
 */

const OlaUberStyleMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 23.3441, lng: 85.3096 }, // Ranchi, Jharkhand
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

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

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    let center = [defaultCenter.lat, defaultCenter.lng];
    let zoom = 13;

    if (path.length > 0) {
      center = [path[0].lat, path[0].lng];
      zoom = 18; // Maximum street-level zoom
    }

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 3,
      maxZoom: 19,
    });

    // Use OpenStreetMap tiles with better styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      className: 'map-tiles', // For custom styling
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

  // Animation effect for vehicle movement
  useEffect(() => {
    if (!isAnimating || !mapReady || !mapInstanceRef.current || path.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPosition(prev => {
        if (prev >= path.length - 1) {
          setIsAnimating(false);
          return prev;
        }
        
        const next = prev + 1;
        const point = path[next];
        
        // Update animated marker position
        if (animatedMarkerRef.current) {
          animatedMarkerRef.current.setLatLng([point.lat, point.lng]);
          mapInstanceRef.current.panTo([point.lat, point.lng], { animate: true, duration: 0.5 });
        }
        
        return next;
      });
    }, 1000); // Move every second

    return () => clearInterval(interval);
  }, [isAnimating, mapReady, path]);

  // Render journey on map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || path.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    console.log('🗺️ Rendering journey with', path.length, 'points');
    console.log('📍 First point:', path[0]);
    console.log('📍 Last point:', path[path.length - 1]);

    // Create route polyline with gradient effect
    const routeCoords = path.map(p => [p.lat, p.lng]);
    
    // Main route line with shadow effect
    L.polyline(routeCoords, {
      color: '#1a73e8',
      weight: 8,
      opacity: 0.3,
      smoothFactor: 1,
    }).addTo(map);
    
    polylineRef.current = L.polyline(routeCoords, {
      color: '#4285F4',
      weight: 6,
      opacity: 0.95,
      smoothFactor: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Add speed-based colored segments for realism
    for (let i = 1; i < path.length; i++) {
      const speed = path[i].speed || 0;
      let segmentColor = '#4285F4'; // Default blue
      
      if (speed > 60) segmentColor = '#EA4335'; // Red for fast
      else if (speed > 40) segmentColor = '#FBBC04'; // Yellow for moderate
      else if (speed > 20) segmentColor = '#34A853'; // Green for slow
      
      L.polyline(
        [[path[i-1].lat, path[i-1].lng], [path[i].lat, path[i].lng]],
        { 
          color: segmentColor, 
          weight: 5, 
          opacity: 0.8,
          lineCap: 'round',
        }
      ).addTo(map);
    }

    // Add direction arrows along the route
    const arrowSpacing = Math.max(1, Math.floor(path.length / 8)); // Show ~8 arrows
    for (let i = arrowSpacing; i < path.length; i += arrowSpacing) {
      const prevPoint = path[i - 1];
      const currPoint = path[i];
      
      // Calculate bearing/angle between two points
      const lat1 = prevPoint.lat * Math.PI / 180;
      const lat2 = currPoint.lat * Math.PI / 180;
      const lng1 = prevPoint.lng * Math.PI / 180;
      const lng2 = currPoint.lng * Math.PI / 180;
      
      const dLng = lng2 - lng1;
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      const bearing = Math.atan2(y, x) * 180 / Math.PI;
      
      // Create arrow marker
      const arrowIcon = L.divIcon({
        className: 'direction-arrow',
        html: `
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 16px solid #4285F4;
            transform: rotate(${bearing}deg);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      
      L.marker([currPoint.lat, currPoint.lng], { 
        icon: arrowIcon,
        interactive: false 
      }).addTo(map);
    }

    // Start marker - Green pickup pin (Ola/Uber style)
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: #34A853;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">A</div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    const startMarker = L.marker([path[0].lat, path[0].lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px; font-family: system-ui;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #34A853;">
            🚀 Journey Start
          </div>
          <div style="font-size: 12px; color: #5f6368; margin-bottom: 6px;">
            ${path[0].time || 'No timestamp'}
          </div>
          ${path[0].speed !== undefined ? `
            <div style="font-size: 12px; margin-bottom: 6px;">
              Speed: <strong>${path[0].speed} km/h</strong>
            </div>
          ` : ''}
          <div style="font-size: 11px; font-family: monospace; color: #80868b; background: #f1f3f4; padding: 4px 8px; border-radius: 4px;">
            ${path[0].lat.toFixed(6)}, ${path[0].lng.toFixed(6)}
          </div>
        </div>
      `);
    markersRef.current.push(startMarker);

    // End marker - Red destination pin (Ola/Uber style)
    const endIcon = L.divIcon({
      className: 'end-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: #EA4335;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">B</div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    const endMarker = L.marker([path[path.length - 1].lat, path[path.length - 1].lng], { icon: endIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px; font-family: system-ui;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #EA4335;">
            🏁 Journey End
          </div>
          <div style="font-size: 12px; color: #5f6368; margin-bottom: 6px;">
            ${path[path.length - 1].time || 'No timestamp'}
          </div>
          ${path[path.length - 1].speed !== undefined ? `
            <div style="font-size: 12px; margin-bottom: 6px;">
              Speed: <strong>${path[path.length - 1].speed} km/h</strong>
            </div>
          ` : ''}
          <div style="font-size: 11px; font-family: monospace; color: #80868b; background: #f1f3f4; padding: 4px 8px; border-radius: 4px;">
            ${path[path.length - 1].lat.toFixed(6)}, ${path[path.length - 1].lng.toFixed(6)}
          </div>
        </div>
      `);
    markersRef.current.push(endMarker);

    // Add animated vehicle marker
    const vehicleIcon = L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(66, 133, 244, 0.6); }
              50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(66, 133, 244, 0.8); }
            }
          </style>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    animatedMarkerRef.current = L.marker([path[0].lat, path[0].lng], { 
      icon: vehicleIcon,
      zIndexOffset: 2000 
    }).addTo(map);
    markersRef.current.push(animatedMarkerRef.current);

    // Add time markers at key points
    const timeStep = Math.max(1, Math.floor(path.length / 5)); // Show 5 time markers
    for (let i = 0; i < path.length; i += timeStep) {
      if (i === 0 || i === path.length - 1) continue; // Skip start/end
      
      const point = path[i];
      const timeIcon = L.divIcon({
        className: 'time-marker',
        html: `
          <div style="
            background: white;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid #4285F4;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-size: 10px;
            font-weight: 600;
            color: #1a73e8;
            white-space: nowrap;
          ">
            🕐 ${point.time ? new Date(point.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Time'}
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      
      const timeMarker = L.marker([point.lat, point.lng], { icon: timeIcon })
        .addTo(map);
      markersRef.current.push(timeMarker);
    }

    // Add waypoint markers (show every 5th point to avoid clutter)
    if (path.length > 2) {
      const step = Math.max(1, Math.floor(path.length / 10)); // Show max 10 waypoints
      
      for (let i = step; i < path.length - 1; i += step) {
        const point = path[i];
        
        const waypointIcon = L.divIcon({
          className: 'waypoint-marker',
          html: `
            <div style="
              background: #4285F4;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const waypointMarker = L.marker([point.lat, point.lng], { icon: waypointIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px; font-family: system-ui;">
              <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">
                📍 Waypoint
              </div>
              <div style="font-size: 12px; color: #5f6368; margin-bottom: 6px;">
                ${point.time || 'No timestamp'}
              </div>
              ${point.speed !== undefined ? `
                <div style="font-size: 12px; margin-bottom: 6px;">
                  Speed: <strong>${point.speed} km/h</strong>
                </div>
              ` : ''}
              <div style="font-size: 11px; font-family: monospace; color: #80868b; background: #f1f3f4; padding: 4px 8px; border-radius: 4px;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
              </div>
            </div>
          `);
        
        markersRef.current.push(waypointMarker);
      }
    }

    // Fit map to show entire journey with padding
    map.fitBounds(routeCoords, { padding: [50, 50] });

  }, [mapReady, path]);

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
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-700 font-medium text-lg">Loading map...</div>
          </div>
        </div>
      )}

      {/* Journey Info Card - Enhanced with Animation Controls */}
      {mapReady && path.length > 0 && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                🚗 Device Journey
              </div>
              <div className="text-xs text-gray-500">
                {path.length} location points • {isAnimating ? 'Playing...' : 'Ready to play'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPosition(0);
                  if (animatedMarkerRef.current && path[0]) {
                    animatedMarkerRef.current.setLatLng([path[0].lat, path[0].lng]);
                  }
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Reset"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isAnimating 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isAnimating ? '⏸ Pause' : '▶ Play Journey'}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(currentPosition / (path.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Point {currentPosition + 1}</span>
            <span>{Math.round((currentPosition / (path.length - 1)) * 100)}%</span>
            <span>{path.length} total</span>
          </div>
        </div>
      )}

      {/* Speed Legend - Enhanced */}
      {mapReady && path.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <div className="text-xs font-bold text-gray-700 mb-2">🎨 Speed Colors</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">0-20 km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">21-40 km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">41-60 km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">60+ km/h</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mapReady && path.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              No Journey Data
            </div>
            <div className="text-sm text-gray-500">
              Select a device to view its journey on the map
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OlaUberStyleMap;

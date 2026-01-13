// src/components/CleanJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Clean Journey Map - Using Leaflet properly
 * Simple, clean implementation for accurate location display
 */

const CleanJourneyMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 20.5937, lng: 78.9629 },
  showWaypoints = true,
  waypointInterval = 5,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      // Fix default marker icon
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    // Calculate initial center and zoom
    let center = [defaultCenter.lat, defaultCenter.lng];
    let zoom = 5;

    if (path.length > 0) {
      const lats = path.map(p => p.lat);
      const lngs = path.map(p => p.lng);
      center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
      
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const maxDiff = Math.max(latDiff, lngDiff);
      
      if (maxDiff < 0.01) zoom = 15;
      else if (maxDiff < 0.1) zoom = 12;
      else if (maxDiff < 0.5) zoom = 10;
      else if (maxDiff < 1) zoom = 8;
      else zoom = 6;
    }

    console.log('Initializing map at:', center, 'zoom:', zoom);

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, defaultCenter, path.length]);

  // Render path and markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (path.length === 0) return;

    console.log('Rendering path with', path.length, 'points');
    console.log('First point:', path[0]);
    console.log('Last point:', path[path.length - 1]);

    // Create polyline
    const pathCoords = path.map(p => [p.lat, p.lng]);
    const polyline = L.polyline(pathCoords, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
    }).addTo(map);
    
    polylineRef.current = polyline;

    // Create custom icons
    const createIcon = (color, label) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
          ">${label}</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    };

    // Add markers
    path.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === path.length - 1;
      const isWaypoint = !isStart && !isEnd && showWaypoints && index % waypointInterval === 0;

      if (isStart || isEnd || isWaypoint) {
        let icon, title;
        
        if (isStart) {
          icon = createIcon('#22c55e', 'S');
          title = 'Journey Start';
        } else if (isEnd) {
          icon = createIcon('#ef4444', 'E');
          title = 'Journey End';
        } else {
          icon = createIcon('#7c3aed', Math.floor(index / waypointInterval));
          title = `Waypoint ${Math.floor(index / waypointInterval)}`;
        }

        const marker = L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="padding: 8px; min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 8px;">${title}</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                ${point.time || 'No timestamp'}
              </div>
              <div style="font-size: 11px; color: #999; font-family: monospace; margin-bottom: 4px;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
              </div>
              ${point.speed ? `<div style="font-size: 12px; color: #666;">Speed: ${point.speed} km/h</div>` : ''}
              <div style="font-size: 11px; color: #999; margin-top: 4px;">
                Point ${index + 1} of ${path.length}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (pathCoords.length > 0) {
      const bounds = L.latLngBounds(pathCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [mapReady, path, showWaypoints, waypointInterval]);

  return (
    <div className={cn('relative w-full h-full min-h-[400px] rounded-xl overflow-hidden', className)}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px', background: '#f0f0f0' }}
      />

      {/* Loading Overlay */}
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading map...</div>
          </div>
        </div>
      )}

      {/* Journey Stats */}
      {mapReady && path.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-4">
          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Journey Stats
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between gap-4">
              <span>Total Points:</span>
              <span className="font-semibold text-blue-600">{path.length}</span>
            </div>
            {path.length > 1 && path[0].time && path[path.length - 1].time && (
              <div className="flex justify-between gap-4">
                <span>Duration:</span>
                <span className="font-semibold text-green-600">
                  {Math.round((new Date(path[path.length - 1].time) - new Date(path[0].time)) / (1000 * 60))} min
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span>Markers:</span>
              <span className="font-semibold text-purple-600">{markersRef.current.length}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">Location:</div>
              <div className="font-mono text-xs text-gray-600">
                Lat: {path[0].lat.toFixed(6)}
              </div>
              <div className="font-mono text-xs text-gray-600">
                Lng: {path[0].lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mapReady && path.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-700 mb-2">
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

export default CleanJourneyMap;

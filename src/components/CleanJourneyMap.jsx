// src/components/CleanJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Clean Journey Map - Realistic Ola/Uber Style
 * 
 * Features:
 * - Clean route visualization
 * - Smooth animated vehicle
 * - Only start/end markers (no clutter)
 * - Speed-based route colors
 * - Playback controls
 */

const CleanJourneyMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 23.3441, lng: 85.3096 },
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLinesRef = useRef([]);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

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
      zoom = 17;
    }

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 3,
      maxZoom: 19,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
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
  }, [leafletLoaded, defaultCenter]);

  // Render route and markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || path.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing
    routeLinesRef.current.forEach(line => line.remove());
    routeLinesRef.current = [];
    if (startMarkerRef.current) startMarkerRef.current.remove();
    if (endMarkerRef.current) endMarkerRef.current.remove();
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.remove();

    console.log('🗺️ Rendering clean journey with', path.length, 'points');

    const routeCoords = path.map(p => [p.lat, p.lng]);

    // Draw route with speed colors
    for (let i = 1; i < path.length; i++) {
      const speed = path[i].speed || 0;
      let color = '#4285F4'; // Blue default
      
      if (speed > 60) color = '#EA4335'; // Red
      else if (speed > 40) color = '#FBBC04'; // Yellow
      else if (speed > 20) color = '#34A853'; // Green
      
      const line = L.polyline(
        [[path[i-1].lat, path[i-1].lng], [path[i].lat, path[i].lng]],
        { 
          color: color, 
          weight: 6, 
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map);
      
      routeLinesRef.current.push(line);
    }

    // Start marker - Simple green pin
    const startIcon = L.divIcon({
      className: 'start-marker-clean',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #34A853;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">A</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    startMarkerRef.current = L.marker([path[0].lat, path[0].lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 600; color: #34A853; margin-bottom: 6px;">🚀 Start</div>
          <div style="font-size: 12px; color: #5f6368;">${path[0].time || 'No time'}</div>
        </div>
      `);

    // End marker - Simple red pin
    const endIcon = L.divIcon({
      className: 'end-marker-clean',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #EA4335;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">B</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    endMarkerRef.current = L.marker([path[path.length - 1].lat, path[path.length - 1].lng], { icon: endIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 600; color: #EA4335; margin-bottom: 6px;">🏁 End</div>
          <div style="font-size: 12px; color: #5f6368;">${path[path.length - 1].time || 'No time'}</div>
        </div>
      `);

    // Animated vehicle marker
    const vehicleIcon = L.divIcon({
      className: 'vehicle-marker-clean',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 16px rgba(66, 133, 244, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: vehiclePulse 2s infinite;
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        <style>
          @keyframes vehiclePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    vehicleMarkerRef.current = L.marker([path[0].lat, path[0].lng], { 
      icon: vehicleIcon,
      zIndexOffset: 3000 
    }).addTo(map);

    // Fit bounds
    map.fitBounds(routeCoords, { padding: [80, 80] });

  }, [mapReady, path]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !mapReady || path.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        
        if (next >= path.length) {
          setIsPlaying(false);
          return prev;
        }

        // Update vehicle position
        if (vehicleMarkerRef.current && path[next]) {
          vehicleMarkerRef.current.setLatLng([path[next].lat, path[next].lng]);
          
          // Smooth pan to follow vehicle
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([path[next].lat, path[next].lng], {
              animate: true,
              duration: 0.3,
            });
          }
        }

        return next;
      });
    }, 800 / playbackSpeed); // Adjust speed

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, mapReady, path]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (vehicleMarkerRef.current && path[0]) {
      vehicleMarkerRef.current.setLatLng([path[0].lat, path[0].lng]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([path[0].lat, path[0].lng], 17);
      }
    }
  };

  const progress = path.length > 0 ? (currentIndex / (path.length - 1)) * 100 : 0;
  const currentPoint = path[currentIndex] || path[0];

  return (
    <div className={cn('relative w-full h-full min-h-[500px] rounded-xl overflow-hidden', className)}>
      {/* Map */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />

      {/* Loading */}
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-700 font-medium">Loading map...</div>
          </div>
        </div>
      )}

      {/* Controls */}
      {mapReady && path.length > 0 && (
        <>
          {/* Top Info */}
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-gray-900">🚗 Journey Playback</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentPoint.time ? new Date(currentPoint.time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 'No time'} • {currentPoint.speed || 0} km/h
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlaybackSpeed(playbackSpeed === 4 ? 1 : playbackSpeed * 2)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"
                >
                  {playbackSpeed}x
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  title="Reset"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition shadow-lg ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
              </div>
            </div>
            
            {/* Progress */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>Point {currentIndex + 1} of {path.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Speed Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3">
            <div className="text-xs font-bold text-gray-700 mb-2">Speed</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">0-20</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">21-40</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">41-60</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">60+</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {mapReady && path.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-2">No Journey Data</div>
            <div className="text-sm text-gray-500">Select a device to view its journey</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanJourneyMap;

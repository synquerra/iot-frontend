// src/components/PremiumJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Premium Journey Map - Ola/Uber Style
 * 
 * Features:
 * - Journey timeline with playback
 * - Animated route visualization
 * - Street-level detail
 * - Play/Pause/Speed controls
 * - Current position indicator
 * - ETA and distance tracking
 * - No API key required!
 */

const PremiumJourneyMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 20.5937, lng: 78.9629 },
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const animationRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const completedPolylineRef = useRef(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x
  const [showTimeline, setShowTimeline] = useState(true);

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
      zoom = 15; // Street-level zoom
    }

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // High-detail street map
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
  }, [leafletLoaded, defaultCenter, path.length]);

  // Setup journey visualization
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || path.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing
    if (polylineRef.current) polylineRef.current.remove();
    if (completedPolylineRef.current) completedPolylineRef.current.remove();
    if (currentMarkerRef.current) currentMarkerRef.current.remove();

    // Full route (gray)
    const fullPath = path.map(p => [p.lat, p.lng]);
    polylineRef.current = L.polyline(fullPath, {
      color: '#d1d5db',
      weight: 6,
      opacity: 0.5,
    }).addTo(map);

    // Completed route (blue)
    completedPolylineRef.current = L.polyline([], {
      color: '#3b82f6',
      weight: 6,
      opacity: 1,
    }).addTo(map);

    // Current position marker (moving car/vehicle)
    const carIcon = L.divIcon({
      className: 'current-position-marker',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    currentMarkerRef.current = L.marker([path[0].lat, path[0].lng], { 
      icon: carIcon,
      zIndexOffset: 1000 
    }).addTo(map);

    // Start and end markers
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div style="
          background: #22c55e;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">S</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const endIcon = L.divIcon({
      className: 'end-marker',
      html: `
        <div style="
          background: #ef4444;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">E</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([path[0].lat, path[0].lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<b>Journey Start</b><br>${path[0].time || ''}`);

    L.marker([path[path.length - 1].lat, path[path.length - 1].lng], { icon: endIcon })
      .addTo(map)
      .bindPopup(`<b>Journey End</b><br>${path[path.length - 1].time || ''}`);

    // Fit bounds
    map.fitBounds(fullPath, { padding: [50, 50] });

  }, [mapReady, path]);

  // Journey playback animation
  useEffect(() => {
    if (!isPlaying || !mapReady || path.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    const animate = () => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        
        if (next >= path.length) {
          setIsPlaying(false);
          return prev;
        }

        // Update current marker position
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setLatLng([path[next].lat, path[next].lng]);
          
          // Pan map to follow
          map.panTo([path[next].lat, path[next].lng], {
            animate: true,
            duration: 0.5
          });
        }

        // Update completed route
        if (completedPolylineRef.current) {
          const completedPath = path.slice(0, next + 1).map(p => [p.lat, p.lng]);
          completedPolylineRef.current.setLatLngs(completedPath);
        }

        return next;
      });
    };

    const interval = 1000 / playbackSpeed; // Adjust speed
    animationRef.current = setInterval(animate, interval);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, mapReady, path.length]);

  // Calculate journey stats
  const calculateDistance = () => {
    if (path.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const lat1 = path[i - 1].lat;
      const lon1 = path[i - 1].lng;
      const lat2 = path[i].lat;
      const lon2 = path[i].lng;
      
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total.toFixed(2);
  };

  const currentPoint = path[currentIndex] || path[0];
  const progress = path.length > 0 ? (currentIndex / (path.length - 1)) * 100 : 0;
  const distance = calculateDistance();

  const handlePlayPause = () => {
    if (currentIndex >= path.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (currentMarkerRef.current && path.length > 0) {
      currentMarkerRef.current.setLatLng([path[0].lat, path[0].lng]);
    }
    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs([]);
    }
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.floor(percentage * (path.length - 1));
    
    setCurrentIndex(newIndex);
    
    if (currentMarkerRef.current && path[newIndex]) {
      currentMarkerRef.current.setLatLng([path[newIndex].lat, path[newIndex].lng]);
    }
    
    if (completedPolylineRef.current) {
      const completedPath = path.slice(0, newIndex + 1).map(p => [p.lat, p.lng]);
      completedPolylineRef.current.setLatLngs(completedPath);
    }
  };

  return (
    <div className={cn('relative w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-slate-100', className)}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Loading */}
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading map...</div>
          </div>
        </div>
      )}

      {/* Journey Controls - Ola/Uber Style */}
      {mapReady && path.length > 0 && (
        <>
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700 mb-1">Journey Progress</div>
                <div className="text-xs text-gray-500">
                  Point {currentIndex + 1} of {path.length} • {distance} km
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaybackSpeed(playbackSpeed === 4 ? 1 : playbackSpeed * 2)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                >
                  {playbackSpeed}x
                </button>
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Toggle timeline"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Current Location Info */}
          <div className="absolute top-24 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 mb-1">Current Location</div>
                <div className="text-xs text-gray-600 mb-2">{currentPoint.time || 'No timestamp'}</div>
                <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {currentPoint.lat.toFixed(6)}, {currentPoint.lng.toFixed(6)}
                </div>
                {currentPoint.speed && (
                  <div className="text-xs text-gray-600 mt-2">
                    Speed: <span className="font-semibold text-blue-600">{currentPoint.speed} km/h</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Controls - Ola/Uber Style */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            {/* Timeline */}
            {showTimeline && (
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-gray-600 w-16">
                    {Math.round(progress)}%
                  </div>
                  <div 
                    className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleTimelineClick}
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg transition-all duration-300"
                      style={{ left: `calc(${progress}% - 8px)` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 w-20 text-right">
                    {currentIndex + 1}/{path.length}
                  </div>
                </div>
              </div>
            )}

            {/* Playback Controls */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  title="Reset"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (currentIndex < path.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                    }
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  title="Next"
                  disabled={currentIndex >= path.length - 1}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
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
              Select a device to view and replay its journey
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumJourneyMap;

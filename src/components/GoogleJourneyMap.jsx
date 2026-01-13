// src/components/GoogleJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Google Maps Journey Visualization Component
 * 
 * Clean implementation using Google Maps API for street-level journey tracking
 * No Leaflet dependencies - pure Google Maps
 * 
 * Features:
 * - Street-level detail with Google Maps
 * - Journey path visualization with polylines
 * - Start/End/Waypoint markers
 * - Auto-fit bounds to show complete journey
 * - Interactive controls (zoom, pan, street view)
 * - Multiple map styles (roadmap, satellite, hybrid, terrain)
 */

const GoogleJourneyMap = ({ 
  path = [], 
  className = '',
  apiKey = 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your API key
  defaultCenter = { lat: 20.5937, lng: 78.9629 }, // India
  defaultZoom = 5,
  showWaypoints = true,
  waypointInterval = 5, // Show every 5th point as waypoint
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, hybrid, terrain
  const [error, setError] = useState(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeId: mapType,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [mapLoaded, defaultCenter, defaultZoom, mapType]);

  // Update map type
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Render journey path and markers
  useEffect(() => {
    if (!mapInstanceRef.current || !path || path.length === 0) return;

    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Convert path to Google Maps LatLng format
    const pathCoordinates = path.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));

    // Create polyline for journey path
    const polyline = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    });

    polylineRef.current = polyline;

    // Create markers
    path.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === path.length - 1;
      const isWaypoint = !isStart && !isEnd && showWaypoints && index % waypointInterval === 0;

      if (isStart || isEnd || isWaypoint) {
        let markerColor = '#7c3aed'; // Default purple
        let markerLabel = '';
        let title = '';

        if (isStart) {
          markerColor = '#22c55e'; // Green
          markerLabel = 'S';
          title = 'Journey Start';
        } else if (isEnd) {
          markerColor = '#ef4444'; // Red
          markerLabel = 'E';
          title = 'Journey End';
        } else {
          markerLabel = String(Math.floor(index / waypointInterval));
          title = `Waypoint ${markerLabel}`;
        }

        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: map,
          title: title,
          label: {
            text: markerLabel,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
            scale: 12,
          }
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <div style="font-weight: bold; color: ${markerColor}; margin-bottom: 8px;">
                ${title}
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                ${point.time || 'No timestamp'}
              </div>
              <div style="font-size: 11px; color: #999; font-family: monospace;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
              </div>
              ${point.speed ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">Speed: ${point.speed} km/h</div>` : ''}
              <div style="font-size: 11px; color: #999; margin-top: 4px;">
                Point ${index + 1} of ${path.length}
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show entire journey
    if (pathCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      pathCoordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 50 });
    }

  }, [path, showWaypoints, waypointInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  if (error) {
    return (
      <div className={cn(
        'w-full h-full min-h-[400px] rounded-xl',
        'bg-red-500/10 border border-red-500/30',
        'flex items-center justify-center',
        className
      )}>
        <div className="text-center p-6">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Map Error
          </div>
          <div className="text-red-400 text-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full min-h-[400px]', className)}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading Google Maps...</div>
          </div>
        </div>
      )}

      {/* Map Type Selector */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Map Style</div>
          <div className="flex flex-col gap-1">
            {[
              { id: 'roadmap', label: '🛣️ Street', desc: 'Street map' },
              { id: 'satellite', label: '🛰️ Satellite', desc: 'Satellite view' },
              { id: 'hybrid', label: '🗺️ Hybrid', desc: 'Satellite + labels' },
              { id: 'terrain', label: '🏔️ Terrain', desc: 'Terrain map' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setMapType(type.id)}
                className={cn(
                  'px-3 py-2 rounded-md text-xs font-medium transition-all text-left',
                  mapType === type.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
                title={type.desc}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Journey Stats */}
      {mapLoaded && path.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            🗺️ Journey Stats
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
          </div>
        </div>
      )}

      {/* Empty State */}
      {mapLoaded && path.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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

export default GoogleJourneyMap;

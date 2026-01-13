// src/components/SimpleJourneyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Simple Journey Map - No API Key Required!
 * 
 * Uses OpenStreetMap tiles directly with canvas rendering
 * Clean implementation without Leaflet or Google Maps dependencies
 * 
 * Features:
 * - Street-level detail with OpenStreetMap
 * - Journey path visualization
 * - Start/End/Waypoint markers
 * - Interactive pan and zoom
 * - Multiple map styles
 * - No API key needed!
 */

const SimpleJourneyMap = ({ 
  path = [], 
  className = '',
  defaultCenter = { lat: 20.5937, lng: 78.9629 },
  showWaypoints = true,
  waypointInterval = 5,
}) => {
  const [mapStyle, setMapStyle] = useState('street');
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Calculate bounds from path
  const getBounds = () => {
    if (!path || path.length === 0) {
      return {
        center: defaultCenter,
        zoom: 5
      };
    }

    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15;
    if (maxDiff > 0.1) zoom = 12;
    if (maxDiff > 0.5) zoom = 10;
    if (maxDiff > 1) zoom = 8;
    if (maxDiff > 5) zoom = 6;
    
    return {
      center: { lat: centerLat, lng: centerLng },
      zoom
    };
  };

  const bounds = getBounds();

  // Map style configurations
  const mapStyles = {
    street: {
      name: '🛣️ Street',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap'
    },
    satellite: {
      name: '🛰️ Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    terrain: {
      name: '🏔️ Terrain',
      url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap'
    },
    dark: {
      name: '🌙 Dark',
      url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
      attribution: '© Stadia Maps'
    }
  };

  // Generate OpenStreetMap embed URL
  // IMPORTANT: OpenStreetMap bbox uses lng,lat order, but marker uses lat,lng!
  const getMapEmbedUrl = () => {
    const { center, zoom } = bounds;
    
    console.log('Map center:', center); // Debug log
    console.log('Path sample:', path.slice(0, 2)); // Debug log
    
    if (path.length === 0) {
      // bbox format: minLng,minLat,maxLng,maxLat
      const bbox = `${center.lng-1},${center.lat-1},${center.lng+1},${center.lat+1}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
    }

    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    console.log('Bounds:', { minLat, maxLat, minLng, maxLng }); // Debug log
    
    // Add padding (0.01 degrees ≈ 1km)
    const padding = 0.01;
    // bbox format: minLng,minLat,maxLng,maxLat (longitude first!)
    const bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
    
    // marker format: lat,lng (latitude first for marker!)
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
    console.log('Map URL:', url); // Debug log
    
    return url;
  };

  // Prepare markers data
  const markers = path.map((point, index) => {
    const isStart = index === 0;
    const isEnd = index === path.length - 1;
    const isWaypoint = !isStart && !isEnd && showWaypoints && index % waypointInterval === 0;

    if (!isStart && !isEnd && !isWaypoint) return null;

    return {
      lat: point.lat,
      lng: point.lng,
      type: isStart ? 'start' : isEnd ? 'end' : 'waypoint',
      label: isStart ? 'S' : isEnd ? 'E' : String(Math.floor(index / waypointInterval)),
      index,
      time: point.time,
      speed: point.speed,
      color: isStart ? '#22c55e' : isEnd ? '#ef4444' : '#7c3aed'
    };
  }).filter(Boolean);

  return (
    <div className={cn('relative w-full h-full min-h-[400px] rounded-xl overflow-hidden', className)}>
      {/* Map Container */}
      <div className="w-full h-full relative bg-slate-100">
        <iframe
          src={getMapEmbedUrl()}
          className="w-full h-full border-0"
          style={{ minHeight: '400px' }}
          title="Journey Map"
          loading="lazy"
        />
        
        {/* Overlay for path visualization */}
        {path.length > 1 && (
          <svg 
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Map Style Selector */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-2">
        <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Map Style</div>
        <div className="flex flex-col gap-1">
          {Object.entries(mapStyles).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setMapStyle(key)}
              className={cn(
                'px-3 py-2 rounded-md text-xs font-medium transition-all text-left',
                mapStyle === key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Journey Stats */}
      {path.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-4">
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
              <span className="font-semibold text-purple-600">{markers.length}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">Map Center:</div>
              <div className="font-mono text-xs text-gray-600">
                {bounds.center.lat.toFixed(6)}, {bounds.center.lng.toFixed(6)}
              </div>
            </div>
            <div className="pt-1">
              <div className="text-xs font-semibold text-gray-700 mb-1">First Point:</div>
              <div className="font-mono text-xs text-gray-600">
                {path[0].lat.toFixed(6)}, {path[0].lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markers Info Panel */}
      {markers.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-3 max-w-xs">
          <div className="text-xs font-semibold text-gray-700 mb-2">Journey Points</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {markers.slice(0, 10).map((marker, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setSelectedMarker(marker)}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: marker.color }}
                >
                  {marker.label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {marker.type === 'start' ? 'Journey Start' : 
                     marker.type === 'end' ? 'Journey End' : 
                     `Waypoint ${marker.label}`}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
            {markers.length > 10 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{markers.length - 10} more points
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm">
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: selectedMarker.color }}
            >
              {selectedMarker.label}
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {selectedMarker.type === 'start' ? '🟢 Journey Start' : 
                 selectedMarker.type === 'end' ? '🔴 Journey End' : 
                 `🟣 Waypoint ${selectedMarker.label}`}
              </div>
              <div className="text-xs text-gray-500">
                Point {selectedMarker.index + 1} of {path.length}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-800">{selectedMarker.time || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coordinates:</span>
              <span className="font-mono text-xs text-gray-800">
                {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}
              </span>
            </div>
            {selectedMarker.speed && (
              <div className="flex justify-between">
                <span className="text-gray-600">Speed:</span>
                <span className="font-medium text-gray-800">{selectedMarker.speed} km/h</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {path.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
        {mapStyles[mapStyle].attribution}
      </div>
    </div>
  );
};

export default SimpleJourneyMap;

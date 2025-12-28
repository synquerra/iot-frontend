// src/components/EnhancedMap.jsx
import React, { useState } from 'react';
import { LeafletComponents } from './LazyMap';
import { cn } from '../design-system/utils/cn';

/* ------------------------------------------------
   FitBounds — proper auto zoom for device path
---------------------------------------------------*/
function FitBounds({ path, useMap }) {
  const map = useMap();

  React.useEffect(() => {
    if (!path || path.length === 0) return;

    const bounds = path.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [path, map]);

  return null;
}

/* ------------------------------------------------
   Enhanced MiniMap component with multiple tile layers and better UX
---------------------------------------------------*/
export function EnhancedMiniMap({ path }) {
  const [mapType, setMapType] = useState('satellite'); // Default to satellite view
  const fallback = [20.5937, 78.9629]; // India

  // Path positions for map rendering
  const pathPositions = path.map((p) => [p.lat, p.lng]);

  // Map styles
  const mapStyles = {
    height: "100%", 
    width: "100%"
  };

  // Different tile layer options for better experience
  const tileLayerOptions = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri, Maxar, Earthstar Geographics",
      name: "Satellite"
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "© OpenTopoMap contributors",
      name: "Terrain"
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      name: "Street"
    },
    dark: {
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      attribution: "© Stadia Maps, © OpenMapTiles © OpenStreetMap contributors",
      name: "Dark"
    }
  };

  const currentTileLayer = tileLayerOptions[mapType];

  return (
    <div className={cn(
      'rounded-xl overflow-hidden shadow-2xl',
      'border border-white/20 backdrop-blur-sm',
      'h-full w-full relative',
      // Responsive height constraints
      'min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]'
    )}>
      {/* Map Type Selector */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {Object.entries(tileLayerOptions).map(([key, layer]) => (
          <button
            key={key}
            onClick={() => setMapType(key)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
              'backdrop-blur-xl border shadow-lg',
              mapType === key
                ? 'bg-blue-500/80 text-white border-blue-400/60 shadow-blue-500/25'
                : 'bg-white/20 text-white/90 border-white/30 hover:bg-white/30 hover:scale-105'
            )}
          >
            {layer.name}
          </button>
        ))}
      </div>

      <LeafletComponents>
        {({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap }) => (
          <MapContainer
            center={fallback}
            zoom={6}
            scrollWheelZoom
            zoomControl={false} // We'll add custom controls
            style={mapStyles}
            className="rounded-xl"
          >
            <FitBounds path={path} useMap={useMap} />

            {/* Dynamic Tile Layer based on selection */}
            <TileLayer
              key={mapType} // Force re-render when map type changes
              url={currentTileLayer.url}
              attribution={currentTileLayer.attribution}
              maxZoom={18}
            />

            {/* Enhanced path rendering with better visibility on all map types */}
            {path.length > 1 && (
              <>
                {/* Outer glow path for better visibility */}
                <Polyline
                  positions={pathPositions}
                  color="#ffffff"
                  weight={8}
                  opacity={0.4}
                />
                {/* Shadow path for depth effect */}
                <Polyline
                  positions={pathPositions}
                  color="#000000"
                  weight={6}
                  opacity={0.3}
                />
                {/* Main vibrant path */}
                <Polyline
                  positions={pathPositions}
                  color="#00ff88"
                  weight={4}
                  opacity={0.9}
                />
                {/* Animated overlay path for movement effect */}
                <Polyline
                  positions={pathPositions}
                  color="#ffffff"
                  weight={2}
                  opacity={0.8}
                  dashArray="10, 5"
                  className="animate-pulse"
                />
              </>
            )}

            {/* Enhanced start marker */}
            {path.length > 0 && (
              <Marker position={[path[0].lat, path[0].lng]}>
                <Popup className="rounded-lg shadow-xl">
                  <div className="text-sm p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                      <span>🚀 Journey Start</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-600 text-xs font-medium">
                        <span className="font-semibold">Time:</span> {path[0].time}
                      </div>
                      <div className="text-gray-600 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        <span className="font-semibold">Coordinates:</span><br/>
                        {path[0].lat.toFixed(6)}, {path[0].lng.toFixed(6)}
                      </div>
                      <div className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded">
                        📍 Starting Point
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Enhanced end marker */}
            {path.length > 1 && (
              <Marker position={[path[path.length - 1].lat, path[path.length - 1].lng]}>
                <Popup className="rounded-lg shadow-xl">
                  <div className="text-sm p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <div className="font-bold text-red-700 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                      <span>🏁 Journey End</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-600 text-xs font-medium">
                        <span className="font-semibold">Time:</span> {path[path.length - 1].time}
                      </div>
                      <div className="text-gray-600 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        <span className="font-semibold">Coordinates:</span><br/>
                        {path[path.length - 1].lat.toFixed(6)}, {path[path.length - 1].lng.toFixed(6)}
                      </div>
                      <div className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded">
                        🏁 Destination
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Waypoint markers for intermediate points */}
            {path.length > 2 && path.slice(1, -1).map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
              >
                <Popup className="rounded-lg shadow-xl">
                  <div className="text-xs p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="font-semibold text-blue-700 mb-1">📍 Waypoint {index + 1}</div>
                    <div className="text-gray-600">
                      <div><span className="font-semibold">Time:</span> {point.time}</div>
                      <div className="font-mono text-xs mt-1 bg-gray-100 px-1 py-0.5 rounded">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </LeafletComponents>

      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button 
          className={cn(
            'w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xl border border-white/40',
            'hover:bg-white/30 hover:scale-110 active:scale-95',
            'transition-all duration-200 ease-out',
            'text-white shadow-xl flex items-center justify-center',
            'group relative overflow-hidden'
          )}
          title="Refresh Map"
        >
          <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Path Statistics Overlay */}
      {path.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1">
                🗺️ Journey: {path.length} points
              </div>
              <div className="text-xs text-white/80 font-medium">
                {path[0]?.time} → {path[path.length - 1]?.time}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Type Info */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20">
        <div className="text-white text-xs font-semibold">
          📡 {currentTileLayer.name} View
        </div>
      </div>
    </div>
  );
}
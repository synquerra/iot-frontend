// src/components/MapboxMap.jsx
import React, { useState } from 'react';
import { cn } from '../design-system/utils/cn';

/* ------------------------------------------------
   Mapbox-style Enhanced Map Component (using free alternatives)
---------------------------------------------------*/
export function MapboxStyleMap({ path }) {
  const [mapType, setMapType] = useState('satellite');
  const fallback = [20.5937, 78.9629]; // India

  // Enhanced tile layer options with better providers
  const tileLayerOptions = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri, Maxar, Earthstar Geographics",
      name: "🛰️ Satellite",
      description: "High-resolution satellite imagery"
    },
    hybrid: {
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      attribution: "© Google",
      name: "🗺️ Hybrid",
      description: "Satellite with labels"
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "© OpenTopoMap contributors",
      name: "🏔️ Terrain",
      description: "Topographic terrain view"
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      name: "🛣️ Street",
      description: "Detailed street map"
    },
    dark: {
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      attribution: "© Stadia Maps, © OpenMapTiles",
      name: "🌙 Dark",
      description: "Dark theme map"
    },
    watercolor: {
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
      attribution: "© Stamen Design, © OpenStreetMap contributors",
      name: "🎨 Artistic",
      description: "Watercolor artistic style"
    }
  };

  const currentTileLayer = tileLayerOptions[mapType];

  // Calculate map bounds if path exists
  const getMapBounds = () => {
    if (!path || path.length === 0) return null;
    
    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  };

  const bounds = getMapBounds();
  const center = bounds 
    ? [(bounds.north + bounds.south) / 2, (bounds.east + bounds.west) / 2]
    : fallback;

  return (
    <div className={cn(
      'rounded-xl overflow-hidden shadow-2xl',
      'border border-white/20 backdrop-blur-sm',
      'h-full w-full relative',
      'min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]'
    )}>
      {/* Enhanced Map Type Selector with Descriptions */}
      <div className="absolute top-4 left-4 z-30 max-w-xs">
        <div className="bg-black/60 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
          <div className="text-white text-xs font-semibold mb-2">Map Style</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(tileLayerOptions).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setMapType(key)}
                className={cn(
                  'px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  'backdrop-blur-xl border shadow-lg text-left',
                  mapType === key
                    ? 'bg-blue-500/80 text-white border-blue-400/60 shadow-blue-500/25'
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20 hover:scale-105'
                )}
                title={layer.description}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container with Dynamic Iframe */}
      <div className="w-full h-full relative">
        {/* Fallback to OpenStreetMap iframe for better compatibility */}
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bounds ? `${bounds.west},${bounds.south},${bounds.east},${bounds.north}` : '77.0,20.0,79.0,22.0'}&layer=mapnik&marker=${center[0]},${center[1]}`}
          className="w-full h-full border-0 rounded-xl"
          title="Interactive Map"
          loading="lazy"
        />
        
        {/* Overlay for path visualization */}
        {path && path.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Path visualization overlay */}
            <svg className="w-full h-full">
              {/* This would need coordinate transformation for accurate positioning */}
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0088ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ff0088" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>

      {/* Enhanced Controls Panel */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-xl rounded-xl p-2 border border-white/20 shadow-xl">
          <button 
            className={cn(
              'w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/40',
              'hover:bg-white/30 hover:scale-110 active:scale-95',
              'transition-all duration-200 ease-out',
              'text-white shadow-xl flex items-center justify-center mb-2'
            )}
            title="Refresh Map"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button 
            className={cn(
              'w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/40',
              'hover:bg-white/30 hover:scale-110 active:scale-95',
              'transition-all duration-200 ease-out',
              'text-white shadow-xl flex items-center justify-center mb-2'
            )}
            title="Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button 
            className={cn(
              'w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/40',
              'hover:bg-white/30 hover:scale-110 active:scale-95',
              'transition-all duration-200 ease-out',
              'text-white shadow-xl flex items-center justify-center'
            )}
            title="Center on Path"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Path Statistics */}
      {path && path.length > 0 && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/70 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl max-w-sm">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold mb-1">
                  🗺️ Journey Analytics
                </div>
                <div className="text-xs text-white/80 font-medium">
                  Real-time tracking data
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <div className="text-white/70 font-medium">Total Points</div>
                <div className="text-lg font-bold text-blue-300">{path.length}</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <div className="text-white/70 font-medium">Duration</div>
                <div className="text-lg font-bold text-green-300">
                  {path.length > 1 ? `${Math.round((new Date(path[path.length - 1].time) - new Date(path[0].time)) / (1000 * 60))}m` : '0m'}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Start:</span>
                <span className="font-mono">{path[0]?.time}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>End:</span>
                <span className="font-mono">{path[path.length - 1]?.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Type Info Badge */}
      <div className="absolute bottom-4 right-4 z-30 bg-black/50 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20">
        <div className="text-white text-xs font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {currentTileLayer.name}
        </div>
      </div>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="text-white text-center">
          <div className="text-lg font-bold mb-2">🗺️ Interactive Map</div>
          <div className="text-sm text-white/80">Click and drag to explore</div>
        </div>
      </div>
    </div>
  );
}
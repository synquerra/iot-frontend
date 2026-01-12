import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { simplifyPath, clusterMarkers, PerformanceTimer } from '../utils/mapOptimization';
import MapPerformanceMonitor from '../utils/mapPerformanceMonitor';
import 'leaflet/dist/leaflet.css';

/**
 * OptimizedLeafletMap Component
 * 
 * Full-featured interactive map with performance optimizations for large datasets.
 * 
 * Features:
 * - Path simplification using Douglas-Peucker algorithm
 * - Smart marker clustering with start/end preservation
 * - Debounced map updates to prevent excessive re-renders
 * - Optimized tile layer configuration with fallback providers
 * - Performance monitoring and logging
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

// Fix Leaflet default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tile provider configuration with fallback chain
const TILE_PROVIDERS = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  },
  {
    name: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, © CartoDB',
    maxZoom: 19,
  },
  {
    name: 'Stamen',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
    attribution: 'Map tiles by Stamen Design, © OpenStreetMap contributors',
    maxZoom: 18,
  },
];

// Custom marker icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 10px;
      ">
        ${label || ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const startIcon = createCustomIcon('#22c55e', 'S');
const endIcon = createCustomIcon('#ef4444', 'E');
const defaultIcon = createCustomIcon('#7c3aed', '');

/**
 * Debounce hook for delaying updates
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const OptimizedLeafletMap = ({
  path = [],
  onPathUpdate = null,
  maxMarkers = 20,
  simplifyPath: shouldSimplifyPath = true,
  clusterMarkers: shouldClusterMarkers = true,
  className = '',
  center = null,
  zoom = 13,
}) => {
  const mapRef = useRef(null);
  const [tileProviderIndex, setTileProviderIndex] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const performanceTimer = useRef(new PerformanceTimer('OptimizedLeafletMap'));
  const performanceMonitor = useRef(new MapPerformanceMonitor());

  // Debounce path updates to prevent excessive re-renders
  const debouncedPath = useDebounce(path, 300);

  // Start performance monitoring
  useEffect(() => {
    performanceTimer.current.start();
    performanceMonitor.current.startInitialRender();
    performanceMonitor.current.setMapType('interactive');
  }, []);

  // Optimize path data with simplification
  const optimizedPath = useMemo(() => {
    if (!debouncedPath || debouncedPath.length === 0) {
      return [];
    }

    const timer = new PerformanceTimer('Path Simplification');
    timer.start();
    
    // Start path simplification tracking
    performanceMonitor.current.startPathSimplification();

    let result = debouncedPath;

    // Apply path simplification for large datasets
    if (shouldSimplifyPath && debouncedPath.length > 100) {
      result = simplifyPath(debouncedPath, 100);
      console.log(`Path simplified: ${debouncedPath.length} → ${result.length} points`);
    }

    timer.stop();
    timer.log(100); // Warn if simplification takes > 100ms
    
    // End path simplification tracking
    performanceMonitor.current.endPathSimplification(debouncedPath.length, result.length);

    return result;
  }, [debouncedPath, shouldSimplifyPath]);

  // Optimize markers with clustering
  const optimizedMarkers = useMemo(() => {
    if (!optimizedPath || optimizedPath.length === 0) {
      return [];
    }

    const timer = new PerformanceTimer('Marker Clustering');
    timer.start();

    let result = optimizedPath;

    // Apply marker clustering if enabled
    if (shouldClusterMarkers && optimizedPath.length > maxMarkers) {
      result = clusterMarkers(optimizedPath, maxMarkers);
      console.log(`Markers clustered: ${optimizedPath.length} → ${result.length} markers`);
    } else {
      result = optimizedPath.map(p => ({ type: 'marker', point: p }));
    }

    timer.stop();
    timer.log(50); // Warn if clustering takes > 50ms

    return result;
  }, [optimizedPath, shouldClusterMarkers, maxMarkers]);

  // Calculate map center and bounds
  const mapCenter = useMemo(() => {
    if (center) return center;

    if (!optimizedPath || optimizedPath.length === 0) {
      return [0, 0];
    }

    const lats = optimizedPath.map(p => p.lat);
    const lngs = optimizedPath.map(p => p.lng);

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    return [centerLat, centerLng];
  }, [optimizedPath, center]);

  // Calculate appropriate zoom level based on path bounds
  const calculatedZoom = useMemo(() => {
    if (!optimizedPath || optimizedPath.length === 0) {
      return zoom;
    }

    const lats = optimizedPath.map(p => p.lat);
    const lngs = optimizedPath.map(p => p.lng);

    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);

    // Heuristic for zoom level based on coordinate range
    if (maxRange > 1) return 10;
    if (maxRange > 0.1) return 13;
    if (maxRange > 0.01) return 15;
    return 17;
  }, [optimizedPath, zoom]);

  // Handle tile layer errors with fallback
  // Requirements: 5.2 - Retry with alternative tile providers
  const handleTileError = useCallback(() => {
    if (tileProviderIndex < TILE_PROVIDERS.length - 1) {
      console.warn(
        `Tile provider ${TILE_PROVIDERS[tileProviderIndex].name} failed, trying ${
          TILE_PROVIDERS[tileProviderIndex + 1].name
        }`
      );
      setTileProviderIndex(prev => prev + 1);
    } else {
      console.error('All tile providers failed');
    }
  }, [tileProviderIndex]);

  // Log performance metrics when map is ready
  useEffect(() => {
    if (isMapReady) {
      performanceTimer.current.stop();
      performanceTimer.current.log(2000); // Warn if initial render > 2s
      
      // End initial render tracking
      performanceMonitor.current.endInitialRender();
      
      // Set marker count
      performanceMonitor.current.setMarkerCount(optimizedMarkers.length);
      
      // Set point counts
      performanceMonitor.current.setPointCounts(path.length, optimizedPath.length);
      
      // Log all metrics
      performanceMonitor.current.logMetrics();

      console.log('Map Performance Metrics:', {
        'Total Points': path.length,
        'Rendered Points': optimizedPath.length,
        'Visible Markers': optimizedMarkers.length,
        'Reduction': `${(((path.length - optimizedPath.length) / path.length) * 100).toFixed(1)}%`,
      });
    }
  }, [isMapReady, path.length, optimizedPath.length, optimizedMarkers.length]);

  // Fit bounds when path changes
  useEffect(() => {
    if (mapRef.current && optimizedPath.length > 1) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(optimizedPath.map(p => [p.lat, p.lng]));
      
      // Add padding to bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [optimizedPath]);

  // Notify parent of path updates
  useEffect(() => {
    if (onPathUpdate && optimizedPath.length > 0) {
      onPathUpdate(optimizedPath);
    }
  }, [optimizedPath, onPathUpdate]);

  const currentTileProvider = TILE_PROVIDERS[tileProviderIndex];

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={calculatedZoom}
        className="w-full h-full rounded-lg"
        ref={mapRef}
        whenReady={() => setIsMapReady(true)}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Tile layer with error handling */}
        <TileLayer
          key={`${currentTileProvider.name}-${tileProviderIndex}`}
          url={currentTileProvider.url}
          attribution={currentTileProvider.attribution}
          maxZoom={currentTileProvider.maxZoom}
          eventHandlers={{
            tileerror: handleTileError,
          }}
        />

        {/* Render optimized path as polyline */}
        {optimizedPath.length > 1 && (
          <Polyline
            positions={optimizedPath.map(p => [p.lat, p.lng])}
            color="#7c3aed"
            weight={3}
            opacity={0.8}
          />
        )}

        {/* Render optimized markers */}
        {optimizedMarkers.map((markerData, index) => {
          const { point, label } = markerData;
          let icon = defaultIcon;

          if (label === 'Start') {
            icon = startIcon;
          } else if (label === 'End') {
            icon = endIcon;
          }

          return (
            <Marker
              key={`marker-${index}-${point.lat}-${point.lng}`}
              position={[point.lat, point.lng]}
              icon={icon}
            >
              {(label || point.time) && (
                <Popup>
                  <div className="text-sm">
                    {label && <div className="font-bold">{label}</div>}
                    {point.time && <div>Time: {point.time}</div>}
                    <div>
                      Lat: {point.lat.toFixed(6)}, Lng: {point.lng.toFixed(6)}
                    </div>
                    {point.speed && <div>Speed: {point.speed} km/h</div>}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* Performance info overlay */}
      {isMapReady && (
        <div className="absolute bottom-4 left-4 bg-surface-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-text-secondary">
          <div className="flex flex-col gap-1">
            <div>
              Points: {path.length} → {optimizedPath.length}
            </div>
            <div>Markers: {optimizedMarkers.length}</div>
            <div className="text-[10px] text-text-tertiary">
              {currentTileProvider.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedLeafletMap;

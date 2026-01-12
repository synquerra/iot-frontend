import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import LightweightMap from './LightweightMap';
import FallbackMapView from './FallbackMapView';
import MapErrorBoundary from './MapErrorBoundary';
import { Loading, ProgressBar } from '../design-system/components/Loading';
import { Button } from '../design-system/components/Button';
import MapPerformanceMonitor from '../utils/mapPerformanceMonitor';

/**
 * MapRenderer Component
 * 
 * Smart orchestrator component that manages map type selection and loading states.
 * Implements a progressive enhancement strategy: starts with a lightweight static map
 * and upgrades to an interactive Leaflet map on demand.
 * 
 * Features:
 * - Automatic map type selection based on path length
 * - Progressive loading with progress indicators
 * - Smooth transitions between map types
 * - Error handling with fallback states
 * - Performance-optimized lazy loading
 * - Error boundary protection with graceful degradation
 * 
 * Requirements: 1.1, 1.2, 3.3, 4.2, 5.1, 5.2, 5.3, 5.4
 */

// Lazy load the OptimizedLeafletMap to reduce initial bundle size
const OptimizedLeafletMap = lazy(() => import('./OptimizedLeafletMap'));

// Map implementation types
const MAP_TYPES = {
  LIGHTWEIGHT: 'lightweight',
  INTERACTIVE: 'interactive',
  FALLBACK: 'fallback',
};

// Loading states
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING_DATA: 'loading_data',
  LOADING_MAP: 'loading_map',
  UPGRADING: 'upgrading',
  READY: 'ready',
  ERROR: 'error',
};

/**
 * Determines the appropriate map implementation based on context
 * 
 * @param {Object} context - Decision context
 * @param {number} context.pathLength - Number of location points
 * @param {boolean} context.userRequestedInteractive - User explicitly requested interactive map
 * @param {boolean} context.leafletFailed - Whether Leaflet loading failed
 * @returns {string} Map type to use
 */
const selectMapImplementation = (context) => {
  const { pathLength, userRequestedInteractive, leafletFailed } = context;

  // If Leaflet failed to load, use fallback
  if (leafletFailed) {
    return MAP_TYPES.FALLBACK;
  }

  // If no data, show lightweight placeholder
  if (pathLength === 0) {
    return MAP_TYPES.LIGHTWEIGHT;
  }

  // If user explicitly requested interactive and dataset is small enough
  if (userRequestedInteractive && pathLength < 50) {
    return MAP_TYPES.INTERACTIVE;
  }

  // For large datasets, start with lightweight and offer upgrade
  if (pathLength >= 50) {
    return userRequestedInteractive ? MAP_TYPES.INTERACTIVE : MAP_TYPES.LIGHTWEIGHT;
  }

  // Default to lightweight for fast initial render
  return MAP_TYPES.LIGHTWEIGHT;
};

const MapRenderer = ({
  path = [],
  center = null,
  zoom = 13,
  onPathUpdate = null,
  maxMarkers = 20,
  simplifyPath = true,
  clusterMarkers = true,
  className = '',
  autoUpgrade = false, // Automatically upgrade to interactive for small datasets
  showMapTypeSelector = true, // Show UI control to switch map types
}) => {
  // State management
  const [mapType, setMapType] = useState(MAP_TYPES.LIGHTWEIGHT);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [userRequestedInteractive, setUserRequestedInteractive] = useState(false);
  const [leafletFailed, setLeafletFailed] = useState(false);

  // Refs
  const mountedRef = useRef(true);
  const initialRenderTime = useRef(null);
  const performanceMonitor = useRef(new MapPerformanceMonitor());

  // Track component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    initialRenderTime.current = performance.now();
    
    // Start performance monitoring
    performanceMonitor.current.startInitialRender();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Determine appropriate map type based on current context
  useEffect(() => {
    const context = {
      pathLength: path.length,
      userRequestedInteractive: userRequestedInteractive || autoUpgrade,
      leafletFailed,
    };

    const selectedType = selectMapImplementation(context);
    
    // Track map type in performance monitor
    performanceMonitor.current.setMapType(selectedType);
    
    // Only update if different from current type
    if (selectedType !== mapType) {
      setMapType(selectedType);
    }
  }, [path.length, userRequestedInteractive, autoUpgrade, leafletFailed, mapType]);

  // Handle upgrade to interactive map
  const handleUpgradeToInteractive = useCallback(() => {
    setLoadingState(LOADING_STATES.UPGRADING);
    setUserRequestedInteractive(true);
    setLoadingProgress(0);

    // Simulate progressive loading for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Cleanup interval on unmount
    return () => clearInterval(progressInterval);
  }, []);

  // Handle downgrade to lightweight map
  const handleDowngradeToLightweight = useCallback(() => {
    setUserRequestedInteractive(false);
    setLoadingState(LOADING_STATES.READY);
    setLoadingProgress(0);
  }, []);

  // Handle Leaflet load error
  const handleLeafletError = useCallback((err) => {
    console.error('Failed to load interactive map:', err);
    setLeafletFailed(true);
    setError(err);
    setLoadingState(LOADING_STATES.ERROR);
  }, []);

  // Handle successful map load
  const handleMapReady = useCallback(() => {
    if (!mountedRef.current) return;

    setLoadingState(LOADING_STATES.READY);
    setLoadingProgress(100);

    // End performance monitoring and log metrics
    performanceMonitor.current.endInitialRender();
    
    // Track point counts
    performanceMonitor.current.setPointCounts(path.length, path.length);
    
    // Log all metrics
    performanceMonitor.current.logMetrics();

    // Log performance metrics (legacy support)
    if (initialRenderTime.current) {
      const renderTime = performance.now() - initialRenderTime.current;
      console.log(`MapRenderer ready in ${renderTime.toFixed(2)}ms`);

      if (renderTime > 2000) {
        console.warn(`Map render exceeded target (2000ms): ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [path.length]);

  // Update loading state when path changes
  useEffect(() => {
    if (path.length > 0 && loadingState === LOADING_STATES.IDLE) {
      // Start data fetch tracking
      performanceMonitor.current.startDataFetch();
      
      setLoadingState(LOADING_STATES.LOADING_DATA);
      setLoadingProgress(50);

      // Simulate data loading completion
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          // End data fetch tracking
          performanceMonitor.current.endDataFetch(path.length);
          
          setLoadingState(LOADING_STATES.READY);
          setLoadingProgress(100);
          
          // End initial render and log metrics
          performanceMonitor.current.endInitialRender();
          performanceMonitor.current.setPointCounts(path.length, path.length);
          performanceMonitor.current.logMetrics();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [path.length, loadingState]);

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (loadingState === LOADING_STATES.UPGRADING) {
      return (
        <div className="absolute inset-0 bg-surface-primary/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
          <Loading
            type="spinner"
            size="lg"
            color="primary"
            text="Loading interactive map..."
          />
          <div className="w-64">
            <ProgressBar
              value={loadingProgress}
              max={100}
              size="md"
              color="primary"
              showValue={true}
            />
          </div>
        </div>
      );
    }

    if (loadingState === LOADING_STATES.LOADING_DATA) {
      return (
        <div className="absolute inset-0 bg-surface-primary/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <Loading
            type="dots"
            size="lg"
            color="primary"
            text="Loading location data..."
          />
        </div>
      );
    }

    return null;
  };

  // Render map type selector
  const renderMapTypeSelector = () => {
    if (!showMapTypeSelector || path.length === 0) {
      return null;
    }

    return (
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant={mapType === MAP_TYPES.LIGHTWEIGHT ? 'primary' : 'ghost'}
          colorScheme="violet"
          size="sm"
          onClick={handleDowngradeToLightweight}
          disabled={mapType === MAP_TYPES.LIGHTWEIGHT}
          ariaLabel="Switch to lightweight map"
        >
          Static
        </Button>
        <Button
          variant={mapType === MAP_TYPES.INTERACTIVE ? 'primary' : 'ghost'}
          colorScheme="violet"
          size="sm"
          onClick={handleUpgradeToInteractive}
          disabled={mapType === MAP_TYPES.INTERACTIVE || leafletFailed}
          ariaLabel="Switch to interactive map"
        >
          Interactive
        </Button>
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => {
    return (
      <div className="w-full h-full min-h-[400px] bg-surface-secondary rounded-lg flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-red-500 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-sm text-text-secondary mb-4">
            {error?.message || 'Unable to load the interactive map'}
          </p>
        </div>
        <Button
          variant="primary"
          colorScheme="violet"
          size="sm"
          onClick={handleDowngradeToLightweight}
          ariaLabel="Switch to static map view"
        >
          View Static Map
        </Button>
      </div>
    );
  };

  // Render fallback table view
  const renderFallbackView = () => {
    return (
      <FallbackMapView
        path={path}
        error={error}
        onRetry={handleDowngradeToLightweight}
      />
    );
  };

  // Main render logic
  const renderMap = () => {
    // Error state
    if (loadingState === LOADING_STATES.ERROR && !leafletFailed) {
      return renderErrorState();
    }

    // Fallback state (Leaflet failed)
    if (mapType === MAP_TYPES.FALLBACK) {
      return renderFallbackView();
    }

    // Interactive map
    if (mapType === MAP_TYPES.INTERACTIVE) {
      return (
        <MapErrorBoundary
          path={path}
          onRetry={() => {
            setLeafletFailed(false);
            setError(null);
            handleUpgradeToInteractive();
          }}
        >
          <Suspense
            fallback={
              <div className="w-full h-full min-h-[400px] bg-surface-secondary rounded-lg flex items-center justify-center">
                <Loading
                  type="spinner"
                  size="lg"
                  color="primary"
                  text="Loading map..."
                />
              </div>
            }
          >
            <OptimizedLeafletMap
              path={path}
              center={center}
              zoom={zoom}
              onPathUpdate={onPathUpdate}
              maxMarkers={maxMarkers}
              simplifyPath={simplifyPath}
              clusterMarkers={clusterMarkers}
              className={className}
            />
          </Suspense>
        </MapErrorBoundary>
      );
    }

    // Lightweight map (default)
    return (
      <MapErrorBoundary
        path={path}
        onRetry={() => {
          setError(null);
          setLoadingState(LOADING_STATES.READY);
        }}
      >
        <LightweightMap
          path={path}
          center={center}
          onUpgrade={handleUpgradeToInteractive}
          showUpgradeButton={path.length > 0 && !leafletFailed}
          className={className}
        />
      </MapErrorBoundary>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map type selector */}
      {renderMapTypeSelector()}

      {/* Main map content */}
      {renderMap()}

      {/* Loading overlay */}
      {renderLoadingOverlay()}

      {/* Performance info */}
      {loadingState === LOADING_STATES.READY && path.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-surface-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                mapType === MAP_TYPES.INTERACTIVE ? 'bg-green-500' : 'bg-blue-500'
              }`}
            />
            <span>
              {mapType === MAP_TYPES.INTERACTIVE ? 'Interactive' : 'Static'} • {path.length} points
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapRenderer;

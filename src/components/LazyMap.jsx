// src/components/LazyMap.jsx
import React, { Suspense, lazy } from 'react';
import { Loading } from '../design-system/components/Loading';

// Lazy load Leaflet components
const LazyLeaflet = lazy(() => 
  import('react-leaflet').then(module => ({
    default: {
      MapContainer: module.MapContainer,
      TileLayer: module.TileLayer,
      Marker: module.Marker,
      Polyline: module.Polyline,
      Popup: module.Popup,
      useMap: module.useMap,
    }
  }))
);

// Loading boundary component for maps
function MapLoadingBoundary({ children, fallback }) {
  return (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center h-80 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border-primary">
            <Loading 
              type="spinner" 
              size="md" 
              text="Loading map..." 
              textPosition="bottom"
            />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Wrapped Leaflet components
export function LeafletComponents({ children }) {
  return (
    <MapLoadingBoundary>
      <LazyLeaflet>
        {({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap }) => 
          children({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap })
        }
      </LazyLeaflet>
    </MapLoadingBoundary>
  );
}

export { MapLoadingBoundary };
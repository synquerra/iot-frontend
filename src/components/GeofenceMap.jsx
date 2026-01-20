import React, { useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

// Custom Leaflet icon for current location marker
const currentLocationIcon = L.divIcon({
  className: 'current-location-marker',
  html: `
    <div class="current-location-marker-inner">
      <div class="current-location-pulse"></div>
      <div class="current-location-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/**
 * GeofenceMap Component
 * Interactive map for drawing and editing geofence polygons
 * 
 * @param {Object} props
 * @param {Array<{latitude: number, longitude: number}>} props.coordinates - Array of coordinate objects
 * @param {Function} props.onCoordinatesChange - Callback when coordinates change
 * @param {boolean} props.editable - Whether the map is editable
 * @param {{lat: number, lng: number}} props.center - Map center coordinates
 * @param {number} props.zoom - Map zoom level
 */
const GeofenceMap = ({
  coordinates = [],
  onCoordinatesChange,
  editable = true,
  center = { lat: 23.3441, lng: 85.3096 }, // Default to Ranchi, India
  zoom = 13
}) => {
  
  // Use current location hook
  const { location, loading, error, getCurrentLocation } = useCurrentLocation();
  
  // State for dismissing error messages
  const [errorDismissed, setErrorDismissed] = React.useState(false);
  
  // Reset error dismissed state when error changes
  useEffect(() => {
    if (error) {
      setErrorDismissed(false);
    }
  }, [error]);
  
  // Convert coordinates to Leaflet format [lat, lng]
  const positions = useMemo(() => {
    return coordinates.map(coord => [coord.latitude, coord.longitude]);
  }, [coordinates]);

  // Map click handler to add new points
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (editable && onCoordinatesChange) {
          const newCoord = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          };
          onCoordinatesChange([...coordinates, newCoord]);
        }
      }
    });
    return null;
  };

  // Map centering component - handles centering when location changes
  const MapCenterController = ({ location }) => {
    const map = useMap();
    
    useEffect(() => {
      if (location) {
        // Use flyTo for smooth animation to the new location
        map.flyTo([location.lat, location.lng], 16, {
          duration: 1.5 // Animation duration in seconds
        });
      }
    }, [location, map]);
    
    return null;
  };

  // Handle marker drag to move points
  const handleMarkerDrag = useCallback((index, event) => {
    if (!editable || !onCoordinatesChange) return;
    
    const newCoordinates = [...coordinates];
    newCoordinates[index] = {
      latitude: event.target.getLatLng().lat,
      longitude: event.target.getLatLng().lng
    };
    onCoordinatesChange(newCoordinates);
  }, [coordinates, editable, onCoordinatesChange]);

  // Handle marker click to delete point
  const handleMarkerClick = useCallback((index) => {
    if (!editable || !onCoordinatesChange) return;
    
    const newCoordinates = coordinates.filter((_, i) => i !== index);
    onCoordinatesChange(newCoordinates);
  }, [coordinates, editable, onCoordinatesChange]);

  // Clear all points
  const handleClearAll = useCallback(() => {
    if (!editable || !onCoordinatesChange) return;
    
    if (coordinates.length > 0) {
      const confirmed = window.confirm('Are you sure you want to clear all points?');
      if (confirmed) {
        onCoordinatesChange([]);
      }
    }
  }, [coordinates, editable, onCoordinatesChange]);

  // Handle current location button click
  const handleCurrentLocation = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle error dismissal
  const handleErrorDismiss = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler />
        <MapCenterController location={location} />
        
        {/* Render markers for each coordinate */}
        {positions.map((position, index) => (
          <Marker
            key={index}
            position={position}
            draggable={editable}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(index, e),
              click: () => handleMarkerClick(index)
            }}
            title={`Point ${index + 1}: ${coordinates[index].latitude.toFixed(6)}, ${coordinates[index].longitude.toFixed(6)}`}
          />
        ))}
        
        {/* Render current location marker */}
        {location && (
          <Marker
            position={[location.lat, location.lng]}
            icon={currentLocationIcon}
            draggable={false}
          >
            <Tooltip permanent={false} direction="top">
              Your current location
            </Tooltip>
          </Marker>
        )}
        
        {/* Render polygon if we have at least 3 points */}
        {positions.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}
      </MapContainer>
      
      {/* Control buttons */}
      {editable && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Screen reader announcement for loading state */}
          <div 
            className="sr-only" 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
          >
            {loading ? 'Fetching your current location...' : ''}
          </div>
          
          <button
            onClick={handleCurrentLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
            aria-label="Go to my current location"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>My Location</span>
              </>
            )}
          </button>
          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
            disabled={coordinates.length === 0}
          >
            Clear All
          </button>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="font-medium text-gray-700">Points: {coordinates.length}</div>
            <div className="text-gray-500 text-xs mt-1">
              {coordinates.length < 3 ? 'Add at least 3 points' : 'Click point to delete'}
            </div>
          </div>
          
          {/* Error message display */}
          {error && !errorDismissed && (
            <div 
              className="bg-red-500/90 backdrop-blur-sm border-2 border-red-400 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-xs"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={handleErrorDismiss}
                className="flex-shrink-0 text-white hover:text-red-100 transition-colors"
                aria-label="Dismiss error message"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeofenceMap;

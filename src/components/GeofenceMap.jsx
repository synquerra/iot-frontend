import React, { useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
        </div>
      )}
    </div>
  );
};

export default GeofenceMap;

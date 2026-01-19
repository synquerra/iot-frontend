/**
 * useGeofenceCommand Hook
 * 
 * React hook for sending geofence commands to IoT devices.
 * Provides loading state, error handling, and success callbacks.
 */

import { useState, useCallback } from 'react';
import { sendDeviceCommand } from '../utils/deviceCommandAPI.js';

/**
 * Hook for managing geofence commands
 * 
 * @returns {Object} Hook state and methods
 * @returns {boolean} loading - Whether a command is currently being sent
 * @returns {Error|null} error - Error object if command failed
 * @returns {Object|null} response - Response data from successful command
 * @returns {Function} setGeofence - Function to send SET_GEOFENCE command
 * @returns {Function} reset - Function to reset state
 */
export function useGeofenceCommand() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  /**
   * Send a SET_GEOFENCE command to a device
   * 
   * @param {string} imei - Device IMEI identifier
   * @param {Object} geofenceData - Geofence configuration
   * @param {string} geofenceData.geofence_number - Geofence number (e.g., 'GEO1')
   * @param {string} geofenceData.geofence_id - Geofence identifier/name
   * @param {Array<{latitude: number, longitude: number}>} geofenceData.coordinates - Array of coordinates
   * @returns {Promise<Object>} Response from the API
   */
  const setGeofence = useCallback(async (imei, geofenceData) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Validate that coordinates form a closed polygon
      const { coordinates } = geofenceData;
      if (coordinates && coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];

        // Auto-close the polygon if needed
        if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
          geofenceData.coordinates = [...coordinates, { ...first }];
        }
      }

      const result = await sendDeviceCommand(imei, 'SET_GEOFENCE', geofenceData);
      setResponse(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Send a DELETE_GEOFENCE command to a device
   * 
   * @param {string} imei - Device IMEI identifier
   * @param {string} geofenceNumber - Geofence number to delete (e.g., 'GEO1')
   * @returns {Promise<Object>} Response from the API
   */
  const deleteGeofence = useCallback(async (imei, geofenceNumber) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // TODO: Update this when DELETE_GEOFENCE API is available
      // For now, this is a placeholder that will throw an error
      const result = await sendDeviceCommand(imei, 'DELETE_GEOFENCE', {
        geofence_number: geofenceNumber
      });
      setResponse(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResponse(null);
  }, []);

  return {
    loading,
    error,
    response,
    setGeofence,
    deleteGeofence,
    reset
  };
}

/**
 * Helper function to create a circular geofence
 * 
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @param {number} numPoints - Number of points to approximate circle (default: 16)
 * @returns {Array<{latitude: number, longitude: number}>} Array of coordinates
 */
export function createCircularGeofence(centerLat, centerLng, radiusMeters, numPoints = 16) {
  // Convert radius from meters to degrees (approximate)
  const radiusLat = radiusMeters / 111320; // 1 degree latitude ≈ 111.32 km
  const radiusLng = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));

  // Generate points around the circle
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = centerLat + radiusLat * Math.sin(angle);
    const lng = centerLng + radiusLng * Math.cos(angle);
    coordinates.push({ latitude: lat, longitude: lng });
  }

  return coordinates;
}

/**
 * Helper function to create a rectangular geofence
 * 
 * @param {Object} topLeft - Top-left corner {lat, lng}
 * @param {Object} bottomRight - Bottom-right corner {lat, lng}
 * @returns {Array<{latitude: number, longitude: number}>} Array of coordinates
 */
export function createRectangularGeofence(topLeft, bottomRight) {
  return [
    { latitude: topLeft.lat, longitude: topLeft.lng },
    { latitude: topLeft.lat, longitude: bottomRight.lng },
    { latitude: bottomRight.lat, longitude: bottomRight.lng },
    { latitude: bottomRight.lat, longitude: topLeft.lng },
    { latitude: topLeft.lat, longitude: topLeft.lng } // Close the polygon
  ];
}

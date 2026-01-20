/**
 * useCurrentLocation Hook
 * 
 * React hook for accessing the user's current geolocation using the browser's Geolocation API.
 * Provides loading state, error handling, and location coordinates.
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing current location access
 * 
 * @returns {Object} Hook state and methods
 * @returns {{lat: number, lng: number}|null} location - Current location coordinates
 * @returns {boolean} loading - Whether location is currently being fetched
 * @returns {string|null} error - Error message if location fetch failed
 * @returns {Function} getCurrentLocation - Function to fetch current location
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch the user's current location using the Geolocation API
   * 
   * @returns {Promise<{lat: number, lng: number}>} Promise that resolves with location coordinates
   */
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const errorMessage = 'Geolocation is not supported by your browser.';
        setError(errorMessage);
        setLoading(false);
        reject(new Error(errorMessage));
        return;
      }

      setLoading(true);
      setError(null);

      // Request current position with options
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          setLoading(false);
          setError(null);
          resolve(coords);
        },
        // Error callback
        (err) => {
          let errorMessage;
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location in your browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Unable to determine your location. Please try again.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while fetching your location.';
          }
          
          setError(errorMessage);
          setLoading(false);
          setLocation(null);
          reject(new Error(errorMessage));
        },
        // Options
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation
  };
}

/**
 * useGeofenceList Hook
 * 
 * React hook for fetching geofence list from the API.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'https://api.synquerra.com';

/**
 * Hook for fetching geofence list
 * 
 * @param {string} imei - Device IMEI identifier
 * @returns {Object} Hook state and methods
 */
export function useGeofenceList(imei) {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  /**
   * Fetch geofences from API
   */
  const fetchGeofences = useCallback(async () => {
    console.log('[useGeofenceList] fetchGeofences called with IMEI:', imei);
    
    if (!imei) {
      console.log('[useGeofenceList] No IMEI provided, clearing geofences');
      setGeofences([]);
      setCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/list/${imei}`;
      console.log('[useGeofenceList] Fetching from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[useGeofenceList] API Response:', data);
      
      // Transform API data to match our component format
      const transformedGeofences = data.data.map((geofence) => ({
        id: geofence.id,
        name: geofence.geofence_id,
        geofence_number: geofence.geofence_number,
        status: 'active', // Assuming all fetched geofences are active
        coordinates: geofence.coordinates,
        coordinatesCount: geofence.coordinates.length,
        radius: null,
        createdAt: geofence.created_at,
        imei: geofence.imei
      }));
      
      console.log('[useGeofenceList] Transformed geofences:', transformedGeofences);
      console.log('[useGeofenceList] Count:', data.count);
      
      setGeofences(transformedGeofences);
      setCount(data.count);
      setLoading(false);
    } catch (err) {
      console.error('[useGeofenceList] Failed to fetch geofences:', err);
      setError(err);
      setGeofences([]);
      setCount(0);
      setLoading(false);
    }
  }, [imei]);

  // Fetch on mount and when IMEI changes
  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  /**
   * Refresh geofences
   */
  const refresh = useCallback(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  return {
    geofences,
    loading,
    error,
    count,
    refresh
  };
}

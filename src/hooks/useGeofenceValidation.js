import { useState, useEffect, useCallback, useRef } from 'react';
import { validatePolygon } from '../utils/geofenceValidation';

/**
 * Custom hook for real-time geofence validation with debouncing
 * @param {Array<{latitude: number, longitude: number}>} coordinates - Array of coordinate objects
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns {{isValid: boolean, errors: Array, warnings: Array, validate: Function}}
 */
export function useGeofenceValidation(coordinates, debounceMs = 300) {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: []
  });
  
  const debounceTimerRef = useRef(null);
  
  // Validation function
  const validate = useCallback((coords) => {
    const result = validatePolygon(coords);
    setValidationState(result);
    return result;
  }, []);
  
  // Debounced validation effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for debounced validation
    debounceTimerRef.current = setTimeout(() => {
      if (coordinates) {
        validate(coordinates);
      }
    }, debounceMs);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [coordinates, debounceMs, validate]);
  
  return {
    isValid: validationState.isValid,
    errors: validationState.errors,
    warnings: validationState.warnings,
    validate
  };
}

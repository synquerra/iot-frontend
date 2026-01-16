import { useCallback, useMemo } from 'react';
import { useUserContext } from '../contexts/UserContext';

/**
 * Device Filter Configuration
 * @typedef {Object} DeviceFilterConfig
 * @property {"PARENTS"|"ADMIN"|null} userType - User type for filtering
 * @property {string[]} allowedIMEIs - List of IMEIs user is allowed to see
 */

/**
 * Custom hook for filtering devices based on user permissions
 * 
 * Implements role-based device filtering:
 * - ADMIN users: See all devices (no filtering)
 * - PARENTS users: See only devices matching their assigned IMEIs
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1
 * 
 * @returns {Object} Device filtering utilities
 * @returns {Function} filterDevices - Filter device list based on user permissions
 * @returns {Function} getFilterConfig - Get current filter configuration
 * @returns {Function} shouldFilterDevices - Check if filtering should be applied
 */
export const useDeviceFilter = () => {
  const { userType, imeis, isAuthenticated } = useUserContext();

  /**
   * Get current filter configuration
   * 
   * @returns {DeviceFilterConfig} Current filter configuration
   */
  const getFilterConfig = useCallback(() => {
    return {
      userType: userType,
      allowedIMEIs: imeis || [],
    };
  }, [userType, imeis]);

  /**
   * Check if device filtering should be applied
   * 
   * Filtering is applied when:
   * - User is authenticated
   * - User type is PARENTS
   * 
   * @returns {boolean} True if filtering should be applied
   */
  const shouldFilterDevices = useCallback(() => {
    return isAuthenticated && userType === 'PARENTS';
  }, [isAuthenticated, userType]);

  /**
   * Filter devices based on user permissions
   * 
   * Filtering rules:
   * - ADMIN users: Return all devices unfiltered (Requirement 3.1)
   * - PARENTS users: Return only devices matching assigned IMEIs (Requirements 2.1, 2.2)
   * - PARENTS with no IMEIs: Return empty array (Requirement 2.3)
   * - Case-insensitive IMEI matching (Requirement 2.4)
   * 
   * @param {Array<Object>} devices - Array of device objects with imei property
   * @returns {Array<Object>} Filtered device array
   */
  const filterDevices = useCallback((devices) => {
    // Validate input
    if (!Array.isArray(devices)) {
      console.warn('useDeviceFilter: devices parameter must be an array');
      return [];
    }

    // If not authenticated, return empty array
    if (!isAuthenticated) {
      return [];
    }

    // ADMIN users see all devices (Requirement 3.1)
    if (userType === 'ADMIN') {
      return devices;
    }

    // PARENTS users see only assigned devices (Requirements 2.1, 2.2, 2.3)
    if (userType === 'PARENTS') {
      // If no IMEIs assigned, return empty array (Requirement 2.3)
      if (!imeis || imeis.length === 0) {
        return [];
      }

      // Normalize allowed IMEIs to lowercase for case-insensitive matching (Requirement 2.4)
      const normalizedAllowedIMEIs = imeis.map(imei => 
        String(imei).toLowerCase()
      );

      // Filter devices by IMEI matching (Requirements 2.1, 2.2, 2.4)
      return devices.filter(device => {
        if (!device || !device.imei) {
          return false;
        }

        const deviceIMEI = String(device.imei).toLowerCase();
        return normalizedAllowedIMEIs.includes(deviceIMEI);
      });
    }

    // Unknown user type - return empty array for safety
    return [];
  }, [isAuthenticated, userType, imeis]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    filterDevices,
    getFilterConfig,
    shouldFilterDevices,
  }), [filterDevices, getFilterConfig, shouldFilterDevices]);
};

export default useDeviceFilter;

/**
 * Filtered Device API Wrapper
 * 
 * Wraps device API functions with automatic user-based filtering.
 * Applies filtering based on user type (PARENTS vs ADMIN) and assigned IMEIs.
 * 
 * Requirements: 4.5
 */

import { listDevices, getDeviceByTopic } from './device.js';
import { loadUserContext } from './authResponseParser.js';

/**
 * Gets the current user's filter configuration from persisted storage
 * @returns {Object} Filter configuration
 * @returns {string|null} userType - User type (PARENTS or ADMIN)
 * @returns {string[]} allowedIMEIs - Array of allowed IMEIs
 */
function getFilterConfig() {
  // Load user context from localStorage
  const userContext = loadUserContext();
  
  if (!userContext) {
    // No user context available - return restrictive config
    return {
      userType: null,
      allowedIMEIs: [],
    };
  }

  return {
    userType: userContext.userType,
    allowedIMEIs: userContext.imeis || [],
  };
}

/**
 * Applies device filtering based on user permissions
 * 
 * Filtering rules:
 * - ADMIN users: Return all devices unfiltered (Requirement 3.1)
 * - PARENTS users: Return only devices matching assigned IMEIs (Requirements 2.1, 2.2)
 * - PARENTS with no IMEIs: Return empty array (Requirement 2.3)
 * - Case-insensitive IMEI matching (Requirement 2.4)
 * - No user context: Return empty array (security default)
 * 
 * @param {Array<Object>} devices - Array of device objects with imei property
 * @param {Object} filterConfig - Filter configuration from getFilterConfig()
 * @returns {Array<Object>} Filtered device array
 */
function applyDeviceFilter(devices, filterConfig) {
  // Validate input
  if (!Array.isArray(devices)) {
    console.warn('deviceFiltered: devices parameter must be an array');
    return [];
  }

  const { userType, allowedIMEIs } = filterConfig;

  // No user context - return empty array for security
  if (!userType) {
    return [];
  }

  // ADMIN users see all devices (Requirement 3.1)
  if (userType === 'ADMIN') {
    return devices;
  }

  // PARENTS users see only assigned devices (Requirements 2.1, 2.2, 2.3)
  if (userType === 'PARENTS') {
    // If no IMEIs assigned, return empty array (Requirement 2.3)
    if (!allowedIMEIs || allowedIMEIs.length === 0) {
      return [];
    }

    // Normalize allowed IMEIs to lowercase for case-insensitive matching (Requirement 2.4)
    const normalizedAllowedIMEIs = allowedIMEIs.map(imei => 
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
  console.warn(`deviceFiltered: Unknown user type "${userType}"`);
  return [];
}

/**
 * Checks if a single device is authorized for the current user
 * 
 * @param {Object} device - Device object with imei property
 * @param {Object} filterConfig - Filter configuration from getFilterConfig()
 * @returns {boolean} True if device is authorized, false otherwise
 */
function isDeviceAuthorized(device, filterConfig) {
  if (!device) {
    return false;
  }

  const { userType, allowedIMEIs } = filterConfig;

  // No user context - not authorized
  if (!userType) {
    return false;
  }

  // ADMIN users can access all devices
  if (userType === 'ADMIN') {
    return true;
  }

  // PARENTS users can only access assigned devices
  if (userType === 'PARENTS') {
    if (!allowedIMEIs || allowedIMEIs.length === 0) {
      return false;
    }

    if (!device.imei) {
      return false;
    }

    // Case-insensitive IMEI matching
    const deviceIMEI = String(device.imei).toLowerCase();
    const normalizedAllowedIMEIs = allowedIMEIs.map(imei => 
      String(imei).toLowerCase()
    );

    return normalizedAllowedIMEIs.includes(deviceIMEI);
  }

  // Unknown user type - not authorized
  return false;
}

/**
 * Fetches devices with automatic filtering applied
 * 
 * Wraps listDevices() and applies user-based filtering to the results.
 * 
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of devices per page (default: 20)
 * @returns {Promise<Object>} Filtered device result
 * @returns {Array<Object>} devices - Filtered paginated devices
 * @returns {number} total - Total count of filtered devices
 * @returns {Array<Object>} full - Full array of filtered devices
 * @returns {number} totalUnfiltered - Total count before filtering (for UI indicators)
 * @returns {number} filteredCount - Count of devices after filtering
 */
export async function listDevicesFiltered(page = 1, limit = 20) {
  try {
    // Get filter configuration
    const filterConfig = getFilterConfig();

    // Fetch all devices from API
    const result = await listDevices(1, 999999); // Get all devices first
    const allDevices = result.full || result.devices || [];

    // Apply filtering
    const filteredDevices = applyDeviceFilter(allDevices, filterConfig);

    // Apply pagination to filtered results
    const total = filteredDevices.length;
    const start = (page - 1) * limit;
    const paged = filteredDevices.slice(start, start + limit);

    return {
      devices: paged,
      total: total,
      full: filteredDevices,
      totalUnfiltered: allDevices.length,
      filteredCount: total,
    };
  } catch (error) {
    console.error('listDevicesFiltered error:', error);
    throw error;
  }
}

/**
 * Fetches a single device by topic with authorization check
 * 
 * Wraps getDeviceByTopic() and verifies the user is authorized to access the device.
 * Returns null if the device exists but user is not authorized.
 * 
 * @param {string} topic - Device topic identifier
 * @returns {Promise<Object|null>} Device object if authorized, null otherwise
 */
export async function getDeviceByTopicFiltered(topic) {
  try {
    // Get filter configuration
    const filterConfig = getFilterConfig();

    // Fetch device from API
    const device = await getDeviceByTopic(topic);

    // If device doesn't exist, return null
    if (!device) {
      return null;
    }

    // Check if user is authorized to access this device
    const authorized = isDeviceAuthorized(device, filterConfig);

    if (!authorized) {
      console.warn(`User not authorized to access device with topic: ${topic}`);
      return null;
    }

    return device;
  } catch (error) {
    console.error('getDeviceByTopicFiltered error:', error);
    throw error;
  }
}

/**
 * Gets the current filter configuration
 * Useful for UI indicators showing filtering status
 * 
 * @returns {Object} Current filter configuration
 * @returns {string|null} userType - User type (PARENTS or ADMIN)
 * @returns {string[]} allowedIMEIs - Array of allowed IMEIs
 * @returns {boolean} isFiltering - True if filtering is active (PARENTS user)
 */
export function getDeviceFilterConfig() {
  const config = getFilterConfig();
  
  return {
    ...config,
    isFiltering: config.userType === 'PARENTS',
  };
}

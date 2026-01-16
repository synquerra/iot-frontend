/**
 * Device Command API Constants
 * 
 * This module defines constants for the Device Command API including
 * the API endpoint, supported command types, and parameter schemas.
 */

/**
 * Synquerra API endpoint for sending device commands
 * Uses environment variable or falls back to production URL
 */
export const API_ENDPOINT = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/send`;

/**
 * Supported device command types
 * 
 * Each command type corresponds to a specific device operation:
 * - STOP_SOS: Stop emergency SOS mode
 * - QUERY_NORMAL: Query normal device status
 * - QUERY_DEVICE_SETTINGS: Query device configuration
 * - SET_CONTACTS: Set emergency contact numbers
 * - SET_GEOFENCE: Configure geographic boundaries
 * - DEVICE_SETTINGS: Update device operational parameters
 * - CALL_ENABLE/DISABLE: Toggle call functionality
 * - LED_ON/OFF: Toggle LED indicator
 * - AMBIENT_ENABLE/DISABLE/STOP: Control ambient monitoring
 * - AIRPLANE_ENABLE: Enable airplane mode
 * - GPS_DISABLE: Disable GPS functionality
 * - FOTA_UPDATE: Trigger firmware update
 */
export const COMMANDS = {
  STOP_SOS: 'STOP_SOS',
  QUERY_NORMAL: 'QUERY_NORMAL',
  QUERY_DEVICE_SETTINGS: 'QUERY_DEVICE_SETTINGS',
  SET_CONTACTS: 'SET_CONTACTS',
  SET_GEOFENCE: 'SET_GEOFENCE',
  DEVICE_SETTINGS: 'DEVICE_SETTINGS',
  CALL_ENABLE: 'CALL_ENABLE',
  CALL_DISABLE: 'CALL_DISABLE',
  LED_ON: 'LED_ON',
  LED_OFF: 'LED_OFF',
  AMBIENT_ENABLE: 'AMBIENT_ENABLE',
  AMBIENT_DISABLE: 'AMBIENT_DISABLE',
  AMBIENT_STOP: 'AMBIENT_STOP',
  AIRPLANE_ENABLE: 'AIRPLANE_ENABLE',
  GPS_DISABLE: 'GPS_DISABLE',
  FOTA_UPDATE: 'FOTA_UPDATE'
};

/**
 * Parameter schemas for commands that require parameters
 * 
 * Defines the required parameter names for each command type:
 * - SET_CONTACTS: Emergency contact phone numbers
 * - SET_GEOFENCE: Geographic boundary configuration
 * - DEVICE_SETTINGS: Device operational parameters (all optional)
 * - FOTA_UPDATE: Firmware update information
 */
export const PARAM_SCHEMAS = {
  SET_CONTACTS: ['phonenum1', 'phonenum2', 'controlroomnum'],
  SET_GEOFENCE: ['geofence_number', 'geofence_id', 'coordinates'],
  DEVICE_SETTINGS: [
    'NormalSendingInterval',
    'SOSSendingInterval',
    'NormalScanningInterval',
    'AirplaneInterval',
    'TemperatureLimit',
    'SpeedLimit',
    'LowbatLimit'
  ],
  FOTA_UPDATE: ['FOTA', 'CRC', 'size', 'vc']
};

/**
 * Device Command Validation Module
 * 
 * This module provides validation functions for device commands, IMEIs, and parameters.
 * All validation functions return an object with { valid: boolean, error?: string }
 */

import { COMMANDS, PARAM_SCHEMAS } from './deviceCommandConstants.js';

/**
 * Validates that an IMEI is provided and is a non-empty string
 * 
 * @param {string} imei - The IMEI to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateIMEI(imei) {
  if (!imei || typeof imei !== 'string' || imei.trim() === '') {
    return {
      valid: false,
      error: 'IMEI is required and must be a non-empty string'
    };
  }
  
  return { valid: true };
}

/**
 * Validates that a command is a supported command type
 * 
 * @param {string} command - The command to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateCommand(command) {
  const validCommands = Object.values(COMMANDS);
  
  if (!validCommands.includes(command)) {
    return {
      valid: false,
      error: `Unsupported command type: ${command}. Valid commands are: ${validCommands.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Validates parameters based on command type
 * 
 * @param {string} command - The command type
 * @param {object} params - The parameters to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateParams(command, params) {
  // Ensure params is an object
  if (params && typeof params !== 'object') {
    return {
      valid: false,
      error: 'Parameters must be an object'
    };
  }
  
  const paramsObj = params || {};
  
  // Command-specific validation
  switch (command) {
    case COMMANDS.SET_CONTACTS:
      return validateSetContactsParams(paramsObj);
    
    case COMMANDS.SET_GEOFENCE:
      return validateSetGeofenceParams(paramsObj);
    
    case COMMANDS.DEVICE_SETTINGS:
      return validateDeviceSettingsParams(paramsObj);
    
    case COMMANDS.FOTA_UPDATE:
      return validateFotaUpdateParams(paramsObj);
    
    // Commands that don't require parameters
    case COMMANDS.STOP_SOS:
    case COMMANDS.QUERY_NORMAL:
    case COMMANDS.QUERY_DEVICE_SETTINGS:
    case COMMANDS.CALL_ENABLE:
    case COMMANDS.CALL_DISABLE:
    case COMMANDS.LED_ON:
    case COMMANDS.LED_OFF:
    case COMMANDS.AMBIENT_ENABLE:
    case COMMANDS.AMBIENT_DISABLE:
    case COMMANDS.AMBIENT_STOP:
    case COMMANDS.AIRPLANE_ENABLE:
    case COMMANDS.GPS_DISABLE:
      return { valid: true };
    
    default:
      return { valid: true };
  }
}

/**
 * Validates SET_CONTACTS command parameters
 * Requires: phonenum1, phonenum2, controlroomnum (all non-empty strings)
 */
function validateSetContactsParams(params) {
  const requiredFields = ['phonenum1', 'phonenum2', 'controlroomnum'];
  
  for (const field of requiredFields) {
    if (!params[field]) {
      return {
        valid: false,
        error: `SET_CONTACTS requires ${field}`
      };
    }
    
    if (typeof params[field] !== 'string' || params[field].trim() === '') {
      return {
        valid: false,
        error: `${field} must be a non-empty string`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Validates SET_GEOFENCE command parameters
 * Requires: geofence_number, geofence_id, coordinates (array with min 3 points, closed polygon)
 */
function validateSetGeofenceParams(params) {
  // Check required fields
  if (!params.geofence_number) {
    return {
      valid: false,
      error: 'SET_GEOFENCE requires geofence_number'
    };
  }
  
  if (!params.geofence_id) {
    return {
      valid: false,
      error: 'SET_GEOFENCE requires geofence_id'
    };
  }
  
  if (!params.coordinates) {
    return {
      valid: false,
      error: 'SET_GEOFENCE requires coordinates'
    };
  }
  
  // Validate coordinates is an array
  if (!Array.isArray(params.coordinates)) {
    return {
      valid: false,
      error: 'coordinates must be an array'
    };
  }
  
  // Validate minimum 3 coordinates
  if (params.coordinates.length < 3) {
    return {
      valid: false,
      error: 'coordinates must contain at least 3 points'
    };
  }
  
  // Validate each coordinate has latitude and longitude
  for (let i = 0; i < params.coordinates.length; i++) {
    const coord = params.coordinates[i];
    
    if (!coord || typeof coord !== 'object') {
      return {
        valid: false,
        error: `coordinate at index ${i} must be an object`
      };
    }
    
    if (!('latitude' in coord)) {
      return {
        valid: false,
        error: `coordinate at index ${i} must have latitude property`
      };
    }
    
    if (!('longitude' in coord)) {
      return {
        valid: false,
        error: `coordinate at index ${i} must have longitude property`
      };
    }
  }
  
  // Validate closed polygon (first and last coordinates match)
  const first = params.coordinates[0];
  const last = params.coordinates[params.coordinates.length - 1];
  
  if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
    return {
      valid: false,
      error: 'coordinates must form a closed polygon (first and last coordinates must match)'
    };
  }
  
  return { valid: true };
}

/**
 * Validates DEVICE_SETTINGS command parameters
 * All parameters are optional, but if provided must be valid numeric strings
 */
function validateDeviceSettingsParams(params) {
  // Validate NormalSendingInterval (positive integer string)
  if (params.NormalSendingInterval !== undefined) {
    const result = validatePositiveIntegerString(params.NormalSendingInterval, 'NormalSendingInterval');
    if (!result.valid) return result;
  }
  
  // Validate SOSSendingInterval (positive integer string)
  if (params.SOSSendingInterval !== undefined) {
    const result = validatePositiveIntegerString(params.SOSSendingInterval, 'SOSSendingInterval');
    if (!result.valid) return result;
  }
  
  // Validate NormalScanningInterval (positive integer string)
  if (params.NormalScanningInterval !== undefined) {
    const result = validatePositiveIntegerString(params.NormalScanningInterval, 'NormalScanningInterval');
    if (!result.valid) return result;
  }
  
  // Validate AirplaneInterval (positive integer string)
  if (params.AirplaneInterval !== undefined) {
    const result = validatePositiveIntegerString(params.AirplaneInterval, 'AirplaneInterval');
    if (!result.valid) return result;
  }
  
  // Validate TemperatureLimit (numeric string)
  if (params.TemperatureLimit !== undefined) {
    const result = validateNumericString(params.TemperatureLimit, 'TemperatureLimit');
    if (!result.valid) return result;
  }
  
  // Validate SpeedLimit (positive numeric string)
  if (params.SpeedLimit !== undefined) {
    const result = validatePositiveNumericString(params.SpeedLimit, 'SpeedLimit');
    if (!result.valid) return result;
  }
  
  // Validate LowbatLimit (numeric string between 0 and 100)
  if (params.LowbatLimit !== undefined) {
    const result = validateBatteryLimit(params.LowbatLimit);
    if (!result.valid) return result;
  }
  
  return { valid: true };
}

/**
 * Validates FOTA_UPDATE command parameters
 * Requires: FOTA (URL), CRC (non-empty string), size (positive integer string), vc (non-empty string)
 */
function validateFotaUpdateParams(params) {
  // Validate FOTA (URL)
  if (!params.FOTA) {
    return {
      valid: false,
      error: 'FOTA_UPDATE requires FOTA parameter'
    };
  }
  
  const urlResult = validateURL(params.FOTA);
  if (!urlResult.valid) {
    return {
      valid: false,
      error: `FOTA must be a valid HTTP or HTTPS URL: ${urlResult.error}`
    };
  }
  
  // Validate CRC (non-empty string)
  if (!params.CRC) {
    return {
      valid: false,
      error: 'FOTA_UPDATE requires CRC parameter'
    };
  }
  
  if (typeof params.CRC !== 'string' || params.CRC.trim() === '') {
    return {
      valid: false,
      error: 'CRC must be a non-empty string'
    };
  }
  
  // Validate size (positive integer string)
  if (!params.size) {
    return {
      valid: false,
      error: 'FOTA_UPDATE requires size parameter'
    };
  }
  
  const sizeResult = validatePositiveIntegerString(params.size, 'size');
  if (!sizeResult.valid) return sizeResult;
  
  // Validate vc (non-empty string)
  if (!params.vc) {
    return {
      valid: false,
      error: 'FOTA_UPDATE requires vc parameter'
    };
  }
  
  if (typeof params.vc !== 'string' || params.vc.trim() === '') {
    return {
      valid: false,
      error: 'vc must be a non-empty string'
    };
  }
  
  return { valid: true };
}

/**
 * Helper: Validates a positive integer string
 */
function validatePositiveIntegerString(value, fieldName) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  const num = parseInt(value, 10);
  
  if (isNaN(num) || num <= 0 || !Number.isInteger(num) || num.toString() !== value) {
    return {
      valid: false,
      error: `${fieldName} must be a positive integer string`
    };
  }
  
  return { valid: true };
}

/**
 * Helper: Validates a numeric string (can be negative or decimal)
 */
function validateNumericString(value, fieldName) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a numeric string`
    };
  }
  
  return { valid: true };
}

/**
 * Helper: Validates a positive numeric string
 */
function validatePositiveNumericString(value, fieldName) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num) || num <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be a positive numeric string`
    };
  }
  
  return { valid: true };
}

/**
 * Helper: Validates battery limit (0-100)
 */
function validateBatteryLimit(value) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'LowbatLimit must be a string'
    };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'LowbatLimit must be a numeric string'
    };
  }
  
  if (num < 0 || num > 100) {
    return {
      valid: false,
      error: 'LowbatLimit must be between 0 and 100'
    };
  }
  
  return { valid: true };
}

/**
 * Helper: Validates URL format (HTTP or HTTPS)
 */
function validateURL(value) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'URL must be a string'
    };
  }
  
  try {
    const url = new URL(value);
    
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        valid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }
    
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Device Command API - Public Interface
 * 
 * This module provides the main public API for sending commands to IoT devices
 * through the Synquerra API. It integrates validation and HTTP client layers
 * to provide a simple, promise-based interface.
 * 
 * @module deviceCommandAPI
 */

import { validateIMEI, validateCommand, validateParams } from './deviceCommandValidation.js';
import { formatRequest, sendRequest, handleResponse } from './deviceCommandHTTP.js';

/**
 * Sends a command to an IoT device via the Synquerra API
 * 
 * This function validates the input parameters, formats the request,
 * sends it to the API, and returns the response. All validation is
 * performed before making the HTTP request to fail fast.
 * 
 * @param {string} imei - Device IMEI identifier (15 digits)
 * @param {string} command - Command type (e.g., "STOP_SOS", "SET_CONTACTS")
 * @param {object} [params={}] - Command-specific parameters (optional)
 * @returns {Promise<object>} Promise that resolves with API response data
 * @throws {Error} Error with code VALIDATION_ERROR, NETWORK_ERROR, or API_ERROR
 * 
 * @example
 * // Send a simple command with no parameters
 * await sendDeviceCommand('123456789012345', 'STOP_SOS');
 * 
 * @example
 * // Send a command with parameters
 * await sendDeviceCommand('123456789012345', 'SET_CONTACTS', {
 *   phonenum1: '+1234567890',
 *   phonenum2: '+0987654321',
 *   controlroomnum: '+1122334455'
 * });
 * 
 * @example
 * // Handle errors
 * try {
 *   const response = await sendDeviceCommand('123456789012345', 'QUERY_NORMAL');
 *   console.log('Command sent successfully:', response);
 * } catch (error) {
 *   if (error.code === 'VALIDATION_ERROR') {
 *     console.error('Invalid input:', error.message);
 *   } else if (error.code === 'NETWORK_ERROR') {
 *     console.error('Network failure:', error.message);
 *   } else if (error.code === 'API_ERROR') {
 *     console.error('API error:', error.message, error.details.statusCode);
 *   }
 * }
 */
export async function sendDeviceCommand(imei, command, params = {}) {
  // Step 1: Validate IMEI
  const imeiValidation = validateIMEI(imei);
  if (!imeiValidation.valid) {
    const error = new Error(imeiValidation.error);
    error.code = 'VALIDATION_ERROR';
    error.details = { field: 'imei' };
    throw error;
  }

  // Step 2: Validate command type
  const commandValidation = validateCommand(command);
  if (!commandValidation.valid) {
    const error = new Error(commandValidation.error);
    error.code = 'VALIDATION_ERROR';
    error.details = { field: 'command' };
    throw error;
  }

  // Step 3: Validate parameters
  const paramsValidation = validateParams(command, params);
  if (!paramsValidation.valid) {
    const error = new Error(paramsValidation.error);
    error.code = 'VALIDATION_ERROR';
    error.details = { field: 'params' };
    throw error;
  }

  // Step 4: Format the request payload
  const payload = formatRequest(imei, command, params);

  // Step 5: Send the request to the API
  const response = await sendRequest(payload);

  // Step 6: Handle and normalize the response
  return handleResponse(response);
}

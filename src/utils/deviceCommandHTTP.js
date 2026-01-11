/**
 * Device Command HTTP Client Module
 * 
 * This module handles HTTP communication with the Synquerra API for sending
 * device commands. It provides functions for formatting requests, sending
 * HTTP requests, and handling responses with proper error handling.
 */

import { API_ENDPOINT } from './deviceCommandConstants.js';

/**
 * Formats a device command request payload
 * 
 * @param {string} imei - Device IMEI identifier
 * @param {string} command - Command type
 * @param {object} params - Command-specific parameters
 * @returns {object} Request payload with imei, command, and params
 */
export function formatRequest(imei, command, params) {
  return {
    imei,
    command,
    params
  };
}

/**
 * Sends a POST request to the Synquerra API
 * 
 * @param {object} payload - Request payload containing imei, command, and params
 * @returns {Promise<object>} Promise that resolves with response data
 * @throws {Error} Error with code NETWORK_ERROR or API_ERROR
 */
export async function sendRequest(payload) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Handle non-2xx responses as API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.code = 'API_ERROR';
      error.details = {
        statusCode: response.status,
        response: errorData
      };
      throw error;
    }

    return await response.json();
  } catch (error) {
    // If it's already an API_ERROR, re-throw it
    if (error.code === 'API_ERROR') {
      throw error;
    }

    // Otherwise, it's a network error
    const networkError = new Error('Failed to connect to API endpoint');
    networkError.code = 'NETWORK_ERROR';
    networkError.details = {
      originalError: error
    };
    throw networkError;
  }
}

/**
 * Processes API response and normalizes the data
 * 
 * @param {object} response - Raw API response
 * @returns {object} Normalized response object
 */
export function handleResponse(response) {
  // Normalize the response structure
  return {
    success: response.success !== false,
    message: response.message,
    data: response.data || response
  };
}

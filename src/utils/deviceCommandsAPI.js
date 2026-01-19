// src/utils/deviceCommandsAPI.js
import axios from 'axios';

const SYNQUERRA_API_BASE = import.meta.env.VITE_BACKEND_API_BASE_URL;

/**
 * Fetches device commands for a specific IMEI
 * @param {string} imei - Device IMEI number
 * @param {number} limit - Maximum number of records to fetch (default: 5)
 * @returns {Promise<Array>} Array of command objects
 */
export const fetchDeviceCommands = async (imei, limit = 10) => {
  try {
    console.log('Fetching device commands for IMEI:', imei, 'with limit:', limit);
    console.log('API Base URL:', SYNQUERRA_API_BASE);
    
    const response = await axios.get(`${SYNQUERRA_API_BASE}/${imei}`, {
      params: { limit },
      headers: {
        'accept': 'application/json'
      }
    });
    
    console.log('Device commands response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching device commands:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Parses command response to extract relevant information
 * @param {Array} commands - Array of command objects
 * @returns {Array} Parsed command data
 */
export const parseDeviceCommands = (commands) => {
  return commands.map(cmd => ({
    id: cmd.id,
    imei: cmd.imei,
    command: cmd.command,
    payload: cmd.payload,
    qos: cmd.qos,
    status: cmd.status,
    createdAt: cmd.created_at,
    updatedAt: cmd.updated_at
  }));
};

/**
 * Gets the latest command for a device
 * @param {string} imei - Device IMEI number
 * @returns {Promise<Object|null>} Latest command object or null
 */
export const getLatestCommand = async (imei) => {
  try {
    const commands = await fetchDeviceCommands(imei, 1);
    return commands.length > 0 ? commands[0] : null;
  } catch (error) {
    console.error('Error fetching latest command:', error);
    return null;
  }
};

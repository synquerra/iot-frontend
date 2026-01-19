// src/utils/deviceConfigAPI.js
import axios from 'axios';

const SYNQUERRA_API_BASE = import.meta.env.VITE_BACKEND_API_BASE_URL;

/**
 * Fetches device configuration or miscellaneous data for a specific IMEI
 * @param {string} imei - Device IMEI number
 * @param {number} limit - Maximum number of records to fetch (default: 5)
 * @returns {Promise<Array>} Array of config/misc objects
 */
export const fetchDeviceConfig = async (imei, limit = 10) => {
  try {
    console.log('Fetching device config for IMEI:', imei, 'with limit:', limit);
    console.log('API Base URL:', SYNQUERRA_API_BASE);
    
    const response = await axios.get(`${SYNQUERRA_API_BASE}/${imei}/config-or-misc`, {
      params: { limit },
      headers: {
        'accept': 'application/json'
      }
    });
    
    console.log('Device config response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching device config:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Parses config response to extract relevant information
 * @param {Array} configs - Array of config objects
 * @returns {Array} Parsed config data
 */
export const parseDeviceConfig = (configs) => {
  return configs.map(cfg => ({
    id: cfg.id,
    topic: cfg.topic,
    type: cfg.type,
    deviceTimestamp: cfg.device_timestamp,
    rawBody: cfg.raw_raw_body,
    // Include telemetry data if present
    imei: cfg.imei,
    latitude: cfg.latitude,
    longitude: cfg.longitude,
    speed: cfg.speed,
    battery: cfg.Battery,
    signal: cfg.Signal,
    alert: cfg.Alert,
    interval: cfg.interval,
    geoid: cfg.Geoid,
    packet: cfg.packet
  }));
};

/**
 * Filters config data to get only configuration acknowledgments
 * @param {Array} configs - Array of config objects (raw or parsed)
 * @returns {Array} Filtered and parsed config acknowledgments
 */
export const getConfigAcknowledgments = (configs) => {
  // Filter raw configs first
  const filtered = configs.filter(cfg => 
    cfg.raw_raw_body && 
    (cfg.raw_raw_body.includes('set') || cfg.raw_raw_body.includes('config'))
  );
  
  // Parse the filtered results
  return parseDeviceConfig(filtered);
};

/**
 * Gets the latest config update for a device
 * @param {string} imei - Device IMEI number
 * @returns {Promise<Object|null>} Latest config object or null
 */
export const getLatestConfig = async (imei) => {
  try {
    const configs = await fetchDeviceConfig(imei, 1);
    return configs.length > 0 ? configs[0] : null;
  } catch (error) {
    console.error('Error fetching latest config:', error);
    return null;
  }
};

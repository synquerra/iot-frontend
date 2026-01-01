/**
 * Telemetry Data Transformation Utilities
 * 
 * This module provides functions to transform raw analytics data from the GraphQL API
 * into structured formats suitable for the telemetry UI components.
 * 
 * Requirements covered:
 * - 1.2: Device information display
 * - 1.5: Recent timestamp detection
 * - 2.2: Live telemetry data display
 * - 3.2: Packet data formatting
 * - 3.5: Timestamp formatting consistency
 */

/**
 * Transform raw analytics data into device information structure
 * @param {Array} analyticsData - Array of analytics data from API
 * @param {string} imei - Device IMEI for fallback
 * @returns {Object} Device information object
 */
function transformDeviceInfo(analyticsData, imei = null) {
  if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
    return {
      imei: imei || 'Unknown',
      firmware: 'Unknown',
      status: 'Offline',
      lastSeen: 'Unknown',
      isRecent: false
    };
  }

  // Sort by timestamp to get the latest data first
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const latestPacket = sortedData[0];
  
  const extractedFirmware = extractFirmwareVersion(latestPacket);
  
  return {
    imei: latestPacket.imei || imei || 'Unknown',
    firmware: extractedFirmware || '-', // Show "-" if no firmware found (like DeviceDetails)
    status: determineDeviceStatus(latestPacket),
    lastSeen: formatTimestamp(latestPacket.deviceTimestamp || latestPacket.timestamp),
    isRecent: isRecentTimestamp(latestPacket.deviceTimestamp || latestPacket.timestamp)
  };
}

/**
 * Transform raw analytics data into live telemetry data structure
 * @param {Array} analyticsData - Array of analytics data from API
 * @returns {Object} Live telemetry data object
 */
function transformLiveData(analyticsData) {
  if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
    return {
      latitude: 0,
      longitude: 0,
      speed: 0,
      temperature: 0,
      battery: 0,
      hasHighTemp: false,
      hasHighSpeed: false
    };
  }

  // Sort by timestamp to get the latest data first
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const latestPacket = sortedData[0];
  const temperature = Number(latestPacket.rawTemperature) || 0;
  const speed = Number(latestPacket.speed) || 0;

  return {
    latitude: Number(latestPacket.latitude) || 0,
    longitude: Number(latestPacket.longitude) || 0,
    speed: speed,
    temperature: temperature,
    battery: Number(latestPacket.battery) || 0,
    hasHighTemp: temperature > 50, // Warning styling for temp > 50°C
    hasHighSpeed: speed > 100 // Alert styling for speed > 100 km/h
  };
}

/**
 * Transform raw analytics data into packet data structure
 * @param {Array} analyticsData - Array of analytics data from API
 * @returns {Object} Packet data object with normal and error packets
 */
function transformPacketData(analyticsData) {
  if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
    return {
      normalPacket: {
        lat: 0,
        lng: 0,
        speed: 0,
        temp: 0,
        battery: 0
      },
      errorPacket: null
    };
  }

  // Sort by timestamp to get the latest data first
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const latestPacket = sortedData[0];

  // Transform normal packet data
  const normalPacket = {
    lat: Number(latestPacket.latitude) || 0,
    lng: Number(latestPacket.longitude) || 0,
    speed: Number(latestPacket.speed) || 0,
    temp: Number(latestPacket.rawTemperature) || 0,
    battery: Number(latestPacket.battery) || 0
  };

  // Find error packets (packets with alert field that's not empty)
  const errorPackets = sortedData.filter(packet => 
    packet.alert && 
    packet.alert.trim() !== '' && 
    packet.alert.trim() !== 'null' &&
    packet.alert.trim() !== 'undefined'
  );

  const errorPacket = errorPackets.length > 0 ? {
    code: errorPackets[0].alert,
    timestamp: formatTimestamp(errorPackets[0].deviceTimestamp || errorPackets[0].timestamp)
  } : null;

  return {
    normalPacket,
    errorPacket
  };
}

/**
 * Determine device status based on the latest packet timestamp
 * @param {Object} packet - Latest analytics packet
 * @returns {string} Device status ('Online' or 'Offline')
 */
function determineDeviceStatus(packet) {
  if (!packet) return 'Offline';
  
  const timestamp = packet.deviceTimestamp || packet.timestamp;
  if (!timestamp) return 'Offline';
  
  const lastSeen = new Date(timestamp);
  const now = new Date();
  
  // Handle invalid dates
  if (isNaN(lastSeen.getTime())) return 'Offline';
  
  const diffMinutes = (now - lastSeen) / (1000 * 60);
  
  // Consider device online if last packet was within 10 minutes
  return diffMinutes <= 10 ? 'Online' : 'Offline';
}

/**
 * Check if timestamp is within the last 5 minutes (considered "recent")
 * @param {string|Date} timestamp - Timestamp to check
 * @returns {boolean} True if timestamp is recent (within 5 minutes)
 */
function isRecentTimestamp(timestamp) {
  if (!timestamp) return false;
  
  const lastSeen = new Date(timestamp);
  const now = new Date();
  
  // Handle invalid dates
  if (isNaN(lastSeen.getTime())) return false;
  
  const diffMinutes = Math.abs(now - lastSeen) / (1000 * 60);
  
  return diffMinutes <= 5;
}

/**
 * Format timestamp to DD-MM-YYYY HH:MM:SS format
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp string
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Extract firmware version from packet data
 * @param {Object} packet - Analytics packet
 * @returns {string|null} Firmware version or null if not found
 */
function extractFirmwareVersion(packet) {
  // Try to extract firmware version from various packet fields
  
  // Check if there's a dedicated firmware field
  if (packet.firmware) {
    return packet.firmware;
  }
  
  // Check packet field (might contain firmware info)
  if (packet.packet && typeof packet.packet === 'string') {
    // Look for firmware version patterns like "516v151" or "v1.2.3"
    const firmwareMatch = packet.packet.match(/([0-9]{3}v[0-9]{3}|v\d+\.\d+\.\d+)/i);
    if (firmwareMatch) {
      return firmwareMatch[1];
    }
  }
  
  // Check rawPacket field
  if (packet.rawPacket && typeof packet.rawPacket === 'string') {
    // Look for firmware version patterns in raw packet data
    const firmwareMatch = packet.rawPacket.match(/([0-9]{3}v[0-9]{3}|v\d+\.\d+\.\d+)/i);
    if (firmwareMatch) {
      return firmwareMatch[1];
    }
  }
  
  // Check if packet field contains version info in different format
  if (packet.packet && typeof packet.packet === 'string') {
    // Try to find any version-like pattern
    const versionMatch = packet.packet.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return `v${versionMatch[1]}`;
    }
  }
  
  // Return null if no firmware version found (will use default)
  return null;
}

/**
 * Validate analytics data structure
 * @param {Array} analyticsData - Analytics data to validate
 * @returns {boolean} True if data structure is valid
 */
function validateAnalyticsData(analyticsData) {
  if (!Array.isArray(analyticsData)) {
    return false;
  }
  
  // Check if at least one packet has required fields
  return analyticsData.some(packet => 
    packet && 
    typeof packet === 'object' &&
    (packet.deviceTimestamp || packet.timestamp) &&
    packet.imei
  );
}

/**
 * Get the most recent packet from analytics data
 * @param {Array} analyticsData - Array of analytics data
 * @returns {Object|null} Most recent packet or null if no data
 */
function getMostRecentPacket(analyticsData) {
  if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
    return null;
  }

  // Sort by timestamp to get the latest data first
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  return sortedData[0];
}

/**
 * Filter packets by type (normal, error, etc.)
 * @param {Array} analyticsData - Array of analytics data
 * @param {string} type - Packet type to filter ('normal', 'error', 'all')
 * @returns {Array} Filtered packets
 */
function filterPacketsByType(analyticsData, type = 'all') {
  if (!analyticsData || !Array.isArray(analyticsData)) {
    return [];
  }

  switch (type.toLowerCase()) {
    case 'error':
      return analyticsData.filter(packet => 
        packet.alert && 
        packet.alert.trim() !== '' && 
        packet.alert.trim() !== 'null' &&
        packet.alert.trim() !== 'undefined'
      );
    
    case 'normal':
      return analyticsData.filter(packet => 
        !packet.alert || 
        packet.alert.trim() === '' || 
        packet.alert.trim() === 'null' ||
        packet.alert.trim() === 'undefined'
      );
    
    case 'all':
    default:
      return analyticsData;
  }
}

// Export all functions
export {
  transformDeviceInfo,
  transformLiveData,
  transformPacketData,
  determineDeviceStatus,
  isRecentTimestamp,
  formatTimestamp,
  validateAnalyticsData,
  getMostRecentPacket,
  filterPacketsByType
};
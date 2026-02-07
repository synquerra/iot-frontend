/**
 * Alert and Error Code Mapper
 * 
 * Maps alert/error codes to human-readable descriptions.
 * Supports A100X series (alerts) and E100X/E101X series (errors).
 */

// Alert code mapping table (A100X series)
const ALERT_MAPPINGS = {
  'a1001': {
    standardCode: 'A1001',
    description: 'Device is charging'
  },
  'charging': {
    standardCode: 'A1001',
    description: 'Device is charging'
  },
  'a1002': {
    standardCode: 'A1002',
    description: 'SOS button pressed for 5 seconds'
  },
  'sos': {
    standardCode: 'A1002',
    description: 'SOS button pressed for 5 seconds'
  },
  'a1003': {
    standardCode: 'A1003',
    description: 'Device has been tampered'
  },
  'tampered': {
    standardCode: 'A1003',
    description: 'Device has been tampered'
  },
  'a1004': {
    standardCode: 'A1004',
    description: 'Device GPS is disabled'
  },
  'gps_disabled': {
    standardCode: 'A1004',
    description: 'Device GPS is disabled'
  },
  'gps disable': {
    standardCode: 'A1004',
    description: 'Device GPS is disabled'
  },
  'a1005': {
    standardCode: 'A1005',
    description: 'Charger removed from device'
  },
  'charger_removed': {
    standardCode: 'A1005',
    description: 'Charger removed from device'
  },
  'charger removed': {
    standardCode: 'A1005',
    description: 'Charger removed from device'
  }
};

// Error code mapping table (E100X/E101X series)
const ERROR_MAPPINGS = {
  'e1001': {
    standardCode: 'E1001',
    description: 'GNSS connectivity issue or invalid packet'
  },
  'gnss_error': {
    standardCode: 'E1001',
    description: 'GNSS connectivity issue or invalid packet'
  },
  'gnss connectivity': {
    standardCode: 'E1001',
    description: 'GNSS connectivity issue or invalid packet'
  },
  'e1002': {
    standardCode: 'E1002',
    description: 'Device failed to register network'
  },
  'network_registration': {
    standardCode: 'E1002',
    description: 'Device failed to register network'
  },
  'network registration': {
    standardCode: 'E1002',
    description: 'Device failed to register network'
  },
  'e1003': {
    standardCode: 'E1003',
    description: 'Device failed to establish data connection'
  },
  'no_data_capability': {
    standardCode: 'E1003',
    description: 'Device failed to establish data connection'
  },
  'no data capability': {
    standardCode: 'E1003',
    description: 'Device failed to establish data connection'
  },
  'e1004': {
    standardCode: 'E1004',
    description: 'Device is under poor network strength'
  },
  'poor_network': {
    standardCode: 'E1004',
    description: 'Device is under poor network strength'
  },
  'poor network': {
    standardCode: 'E1004',
    description: 'Device is under poor network strength'
  },
  'poor network strength': {
    standardCode: 'E1004',
    description: 'Device is under poor network strength'
  },
  'e1005': {
    standardCode: 'E1005',
    description: 'Device failed to initialize MQTT connection'
  },
  'mqtt_connection': {
    standardCode: 'E1005',
    description: 'Device failed to initialize MQTT connection'
  },
  'mqtt connection': {
    standardCode: 'E1005',
    description: 'Device failed to initialize MQTT connection'
  },
  'e1006': {
    standardCode: 'E1006',
    description: 'Device failed to initialize FTP connection'
  },
  'ftp_connection': {
    standardCode: 'E1006',
    description: 'Device failed to initialize FTP connection'
  },
  'ftp connection': {
    standardCode: 'E1006',
    description: 'Device failed to initialize FTP connection'
  },
  'e1011': {
    standardCode: 'E1011',
    description: 'Device has no SIM card'
  },
  'no_sim': {
    standardCode: 'E1011',
    description: 'Device has no SIM card'
  },
  'no sim': {
    standardCode: 'E1011',
    description: 'Device has no SIM card'
  },
  'e1012': {
    standardCode: 'E1012',
    description: 'Issue in microphone connection'
  },
  'microphone_connection': {
    standardCode: 'E1012',
    description: 'Issue in microphone connection'
  },
  'microphone connection': {
    standardCode: 'E1012',
    description: 'Issue in microphone connection'
  },
  'e1013': {
    standardCode: 'E1013',
    description: 'Flash memory malfunction'
  },
  'flash_memory': {
    standardCode: 'E1013',
    description: 'Flash memory malfunction'
  },
  'flash memory': {
    standardCode: 'E1013',
    description: 'Flash memory malfunction'
  },
  'flash memory malfunction': {
    standardCode: 'E1013',
    description: 'Flash memory malfunction'
  }
};

/**
 * Maps alert or error codes to human-readable descriptions
 * 
 * @param {string} code - The alert or error code (e.g., 'A1001', 'E1001', 'sos', 'gnss_error')
 * @param {string} packetType - The packet type ("A" for alert, "E" for error)
 * @returns {Object} Object containing standardCode, description, and category
 * 
 * @example
 * mapAlertErrorCode('A1002', 'A')
 * // Returns: { standardCode: 'A1002', description: 'SOS button pressed for 5 seconds', category: 'alert' }
 * 
 * mapAlertErrorCode('E1001', 'E')
 * // Returns: { standardCode: 'E1001', description: 'GNSS connectivity issue or invalid packet', category: 'error' }
 */
export function mapAlertErrorCode(code, packetType) {
  // Handle null/undefined inputs
  if (!code) {
    const category = packetType === 'A' ? 'alert' : 'error';
    return {
      standardCode: 'UNKNOWN',
      description: `Unknown ${category}`,
      category
    };
  }

  // Normalize code to lowercase for case-insensitive matching
  const normalizedCode = String(code).toLowerCase().trim();
  
  // Handle empty string after trimming
  if (!normalizedCode) {
    const category = packetType === 'A' ? 'alert' : 'error';
    return {
      standardCode: 'UNKNOWN',
      description: `Unknown ${category}`,
      category
    };
  }
  
  const category = packetType === 'A' ? 'alert' : 'error';

  // Select appropriate mapping table based on packet type
  const mappingTable = packetType === 'A' ? ALERT_MAPPINGS : ERROR_MAPPINGS;

  // Look up the code in the mapping table
  const mapping = Object.prototype.hasOwnProperty.call(mappingTable, normalizedCode) 
    ? mappingTable[normalizedCode] 
    : null;

  // Return mapped code or fallback for unknown codes
  if (mapping) {
    return {
      standardCode: mapping.standardCode,
      description: mapping.description,
      category
    };
  }

  // Fallback for unknown codes
  return {
    standardCode: code.toUpperCase(),
    description: `Unknown ${category}`,
    category
  };
}

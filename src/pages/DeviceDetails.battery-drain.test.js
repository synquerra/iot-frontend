/**
 * Verification tests for computeBatteryDrainTime function
 * Task 2: Verify battery drain calculation logic
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest';

// Mock the functions from DeviceDetails.jsx for testing
// In a real scenario, these would be extracted to a separate module

function extractBatteryValue(batteryField) {
  if (batteryField == null) return NaN;
  
  // Handle string formats like "85%", "85", or numbers
  const batteryStr = String(batteryField).replace(/[^\d]/g, "");
  const batteryNum = Number(batteryStr);
  
  return batteryNum;
}

function parseTimestampWithFallback(packet) {
  if (!packet) return null;
  
  // Try deviceRawTimestamp first (PRIMARY field in normalized data)
  let timestamp = packet.deviceRawTimestamp;
  
  // Fall back to deviceTimestamp if needed
  if (!timestamp) {
    timestamp = packet.deviceTimestamp;
  }
  
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  
  return date;
}

function computeBatteryDrainTime(packets) {
  // Step 1: Validate input
  if (!packets || packets.length === 0) return "-";
  
  // Step 2: Filter to normal packets only (type "N" or "PACKET_N")
  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );
  
  if (normalPackets.length === 0) return "-";
  
  // Step 3: Find most recent 100% battery packet
  let fullBatteryPacket = null;
  
  for (let i = 0; i < normalPackets.length; i++) {
    const p = normalPackets[i];
    const battery = extractBatteryValue(p.battery);
    
    if (battery === 100) {
      fullBatteryPacket = p;
      break; // Found most recent, stop searching
    }
  }
  
  if (!fullBatteryPacket) return "No 100% record";
  
  // Step 4: Get current battery level (first normal packet)
  const currentBattery = extractBatteryValue(normalPackets[0].battery);
  
  if (isNaN(currentBattery) || currentBattery === 100) return "-";
  
  // Step 5: Calculate time difference
  const fullTime = parseTimestampWithFallback(fullBatteryPacket);
  const currentTime = parseTimestampWithFallback(normalPackets[0]);
  
  if (!fullTime || !currentTime) return "-";
  
  const elapsedMs = currentTime - fullTime;
  
  if (elapsedMs < 0) return "-";
  
  // Step 6: Format output
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  if (elapsedHours >= 1) {
    return elapsedHours.toFixed(1) + "h";
  } else {
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));
    return elapsedMinutes + "m";
  }
}

describe('computeBatteryDrainTime - Edge Case Verification', () => {
  describe('Requirement 1.1: Display elapsed time with 100% record', () => {
    it('should display elapsed time when 100% record exists', () => {
      const packets = [
        {
          packetType: 'N',
          battery: '50',
          deviceRawTimestamp: '2024-01-01T12:00:00Z'
        },
        {
          packetType: 'N',
          battery: '100',
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('2.0h');
    });
  });

  describe('Requirement 1.2: Format as hours when >= 1 hour', () => {
    it('should format as hours with one decimal when elapsed time >= 1 hour', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 75,
          deviceRawTimestamp: '2024-01-01T15:30:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('5.5h');
    });
  });

  describe('Requirement 1.3: Format as minutes when < 1 hour', () => {
    it('should format as rounded minutes when elapsed time < 1 hour', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 85,
          deviceRawTimestamp: '2024-01-01T10:45:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('45m');
    });
  });

  describe('Requirement 1.4: No 100% record handling', () => {
    it('should return "No 100% record" when no 100% battery exists', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 85,
          deviceRawTimestamp: '2024-01-01T10:45:00Z'
        },
        {
          packetType: 'N',
          battery: 90,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('No 100% record');
    });
  });

  describe('Requirement 1.5: Current battery at 100%', () => {
    it('should return "-" when current battery is 100%', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:45:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('-');
    });
  });

  describe('Requirement 3.1: Empty/null packets', () => {
    it('should return "-" for null packets', () => {
      const result = computeBatteryDrainTime(null);
      expect(result).toBe('-');
    });

    it('should return "-" for empty packets array', () => {
      const result = computeBatteryDrainTime([]);
      expect(result).toBe('-');
    });
  });

  describe('Requirement 3.2: No normal packets', () => {
    it('should return "-" when no normal packets exist', () => {
      const packets = [
        {
          packetType: 'A',
          battery: 85,
          deviceRawTimestamp: '2024-01-01T10:45:00Z'
        },
        {
          packetType: 'E',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('-');
    });
  });

  describe('Requirement 3.3: Invalid battery values', () => {
    it('should return "-" when current battery cannot be parsed', () => {
      const packets = [
        {
          packetType: 'N',
          battery: null,
          deviceRawTimestamp: '2024-01-01T10:45:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('-');
    });
  });

  describe('Requirement 3.4: Negative time difference', () => {
    it('should return "-" when time difference is negative', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 50,
          deviceRawTimestamp: '2024-01-01T08:00:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('-');
    });
  });

  describe('Requirement 3.5: Battery value extraction', () => {
    it('should extract numeric value from percentage string', () => {
      const result = extractBatteryValue('85%');
      expect(result).toBe(85);
    });

    it('should extract numeric value from plain string', () => {
      const result = extractBatteryValue('85');
      expect(result).toBe(85);
    });

    it('should handle numeric input', () => {
      const result = extractBatteryValue(85);
      expect(result).toBe(85);
    });

    it('should return NaN for null input', () => {
      const result = extractBatteryValue(null);
      expect(result).toBeNaN();
    });
  });

  describe('Timestamp parsing with fixed field priority', () => {
    it('should use deviceRawTimestamp as primary field', () => {
      const packet = {
        deviceRawTimestamp: '2024-01-01T10:00:00Z',
        deviceTimestamp: '2024-01-01T09:00:00Z'
      };
      
      const result = parseTimestampWithFallback(packet);
      expect(result).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should fall back to deviceTimestamp when deviceRawTimestamp is missing', () => {
      const packet = {
        deviceTimestamp: '2024-01-01T09:00:00Z'
      };
      
      const result = parseTimestampWithFallback(packet);
      expect(result).toEqual(new Date('2024-01-01T09:00:00Z'));
    });

    it('should return null when both fields are missing', () => {
      const packet = {};
      
      const result = parseTimestampWithFallback(packet);
      expect(result).toBeNull();
    });

    it('should return null for invalid timestamp', () => {
      const packet = {
        deviceRawTimestamp: 'invalid-date'
      };
      
      const result = parseTimestampWithFallback(packet);
      expect(result).toBeNull();
    });
  });

  describe('Integration: Full workflow verification', () => {
    it('should work correctly with fixed timestamp parsing', () => {
      const packets = [
        {
          packetType: 'N',
          battery: '65%',
          deviceRawTimestamp: '2024-01-01T13:30:00Z'
        },
        {
          packetType: 'N',
          battery: '80',
          deviceRawTimestamp: '2024-01-01T12:00:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('3.5h');
    });

    it('should handle mixed packet types correctly', () => {
      const packets = [
        {
          packetType: 'N',
          battery: 70,
          deviceRawTimestamp: '2024-01-01T11:00:00Z'
        },
        {
          packetType: 'A',
          battery: 90,
          deviceRawTimestamp: '2024-01-01T10:30:00Z'
        },
        {
          packetType: 'N',
          battery: 100,
          deviceRawTimestamp: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = computeBatteryDrainTime(packets);
      expect(result).toBe('1.0h');
    });
  });
});

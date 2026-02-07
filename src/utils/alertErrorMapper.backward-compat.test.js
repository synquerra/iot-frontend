/**
 * Backward Compatibility Tests for Alert Error Mapper
 * 
 * These tests verify that the code mapper handles legacy packet data gracefully
 * and maintains backward compatibility with existing packet formats.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect } from 'vitest';
import { mapAlertErrorCode } from './alertErrorMapper.js';

describe('Alert Error Mapper - Backward Compatibility', () => {
  describe('Legacy Code Handling', () => {
    it('should handle legacy numeric alert codes', () => {
      // Legacy systems might send numeric codes
      const result = mapAlertErrorCode('1', 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('1');
      expect(result.description).toContain('Unknown alert');
      expect(result.category).toBe('alert');
    });

    it('should handle legacy numeric error codes', () => {
      const result = mapAlertErrorCode('2', 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('2');
      expect(result.description).toContain('Unknown error');
      expect(result.category).toBe('error');
    });

    it('should handle legacy uppercase codes', () => {
      const result = mapAlertErrorCode('SOS', 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('A1002');
      expect(result.description).toContain('SOS');
      expect(result.category).toBe('alert');
    });

    it('should handle legacy mixed case codes', () => {
      const result = mapAlertErrorCode('Gnss_Error', 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('E1001');
      expect(result.description).toContain('GNSS');
      expect(result.category).toBe('error');
    });

    it('should handle codes with extra whitespace', () => {
      const result = mapAlertErrorCode('  charging  ', 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('A1001');
      expect(result.description).toContain('Charging');
      expect(result.category).toBe('alert');
    });
  });

  describe('Packet Type Support', () => {
    it('should handle alert packet type "A"', () => {
      const result = mapAlertErrorCode('sos', 'A');
      
      expect(result).toBeDefined();
      expect(result.category).toBe('alert');
    });

    it('should handle error packet type "E"', () => {
      const result = mapAlertErrorCode('gnss_error', 'E');
      
      expect(result).toBeDefined();
      expect(result.category).toBe('error');
    });

    it('should handle unknown codes with packet type "A"', () => {
      const result = mapAlertErrorCode('legacy_alert_123', 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('legacy_alert_123');
      expect(result.category).toBe('alert');
    });

    it('should handle unknown codes with packet type "E"', () => {
      const result = mapAlertErrorCode('legacy_error_456', 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('legacy_error_456');
      expect(result.category).toBe('error');
    });
  });

  describe('Missing Field Handling', () => {
    it('should handle null alert code', () => {
      const result = mapAlertErrorCode(null, 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown alert');
      expect(result.category).toBe('alert');
    });

    it('should handle undefined alert code', () => {
      const result = mapAlertErrorCode(undefined, 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown alert');
      expect(result.category).toBe('alert');
    });

    it('should handle null error code', () => {
      const result = mapAlertErrorCode(null, 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown error');
      expect(result.category).toBe('error');
    });

    it('should handle undefined error code', () => {
      const result = mapAlertErrorCode(undefined, 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown error');
      expect(result.category).toBe('error');
    });

    it('should handle empty string code', () => {
      const result = mapAlertErrorCode('', 'A');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown alert');
      expect(result.category).toBe('alert');
    });

    it('should handle whitespace-only code', () => {
      const result = mapAlertErrorCode('   ', 'E');
      
      expect(result).toBeDefined();
      expect(result.standardCode).toBe('UNKNOWN');
      expect(result.description).toContain('Unknown error');
      expect(result.category).toBe('error');
    });
  });

  describe('No Breaking Changes', () => {
    it('should not throw errors for any input combination', () => {
      const testCases = [
        [null, 'A'],
        [undefined, 'E'],
        ['', 'A'],
        ['   ', 'E'],
        ['charging', 'A'],
        ['CHARGING', 'A'],
        ['gnss_error', 'E'],
        ['GNSS_ERROR', 'E'],
        ['unknown_code_123', 'A'],
        ['12345', 'E'],
        ['!@#$%', 'A'],
        ['🚨', 'E']
      ];

      testCases.forEach(([code, packetType]) => {
        expect(() => {
          const result = mapAlertErrorCode(code, packetType);
          expect(result).toBeDefined();
          expect(result).toHaveProperty('standardCode');
          expect(result).toHaveProperty('description');
          expect(result).toHaveProperty('category');
        }).not.toThrow();
      });
    });

    it('should always return valid structure regardless of input', () => {
      const testCases = [
        null,
        undefined,
        '',
        '   ',
        'charging',
        'unknown',
        '123',
        '!@#'
      ];

      testCases.forEach(code => {
        const alertResult = mapAlertErrorCode(code, 'A');
        const errorResult = mapAlertErrorCode(code, 'E');

        // Verify alert result structure
        expect(alertResult).toHaveProperty('standardCode');
        expect(alertResult).toHaveProperty('description');
        expect(alertResult).toHaveProperty('category');
        expect(alertResult.category).toBe('alert');
        expect(typeof alertResult.standardCode).toBe('string');
        expect(typeof alertResult.description).toBe('string');

        // Verify error result structure
        expect(errorResult).toHaveProperty('standardCode');
        expect(errorResult).toHaveProperty('description');
        expect(errorResult).toHaveProperty('category');
        expect(errorResult.category).toBe('error');
        expect(typeof errorResult.standardCode).toBe('string');
        expect(typeof errorResult.description).toBe('string');
      });
    });
  });

  describe('Real-World Legacy Scenarios', () => {
    it('should handle packets with old alert format', () => {
      // Simulate old packet format where alert might be a simple string
      const oldAlertCodes = ['SOS', 'CHARGING', 'TAMPERED'];
      
      oldAlertCodes.forEach(code => {
        const result = mapAlertErrorCode(code, 'A');
        expect(result).toBeDefined();
        expect(result.category).toBe('alert');
        expect(result.standardCode).toMatch(/^A100[1-5]$/);
      });
    });

    it('should handle packets with old error format', () => {
      // Simulate old packet format where error might be a simple string
      const oldErrorCodes = ['GNSS_ERROR', 'NETWORK_REGISTRATION', 'NO_SIM'];
      
      oldErrorCodes.forEach(code => {
        const result = mapAlertErrorCode(code, 'E');
        expect(result).toBeDefined();
        expect(result.category).toBe('error');
        expect(result.standardCode).toMatch(/^E10[01][0-9]$/);
      });
    });

    it('should handle packets with completely unknown legacy codes', () => {
      // Simulate very old or custom codes that don't match current mappings
      const legacyCodes = ['OLD_ALERT_1', 'CUSTOM_ERROR_2', 'LEGACY_CODE_3'];
      
      legacyCodes.forEach(code => {
        const alertResult = mapAlertErrorCode(code, 'A');
        const errorResult = mapAlertErrorCode(code, 'E');

        // Should not throw and should return fallback
        expect(alertResult.standardCode).toBe(code);
        expect(alertResult.description).toContain('Unknown alert');
        
        expect(errorResult.standardCode).toBe(code);
        expect(errorResult.description).toContain('Unknown error');
      });
    });

    it('should handle mixed packet data with various code formats', () => {
      // Simulate a real scenario with mixed old and new data
      const mixedPackets = [
        { code: 'charging', type: 'A', expected: 'A1001' },
        { code: 'SOS', type: 'A', expected: 'A1002' },
        { code: 'old_alert', type: 'A', expected: 'old_alert' },
        { code: 'gnss_error', type: 'E', expected: 'E1001' },
        { code: 'NETWORK_REGISTRATION', type: 'E', expected: 'E1002' },
        { code: 'legacy_error', type: 'E', expected: 'legacy_error' },
        { code: null, type: 'A', expected: 'UNKNOWN' },
        { code: '', type: 'E', expected: 'UNKNOWN' }
      ];

      mixedPackets.forEach(({ code, type, expected }) => {
        const result = mapAlertErrorCode(code, type);
        expect(result.standardCode).toBe(expected);
        expect(result.category).toBe(type === 'A' ? 'alert' : 'error');
      });
    });
  });

  describe('Component Integration Compatibility', () => {
    it('should work with DeviceDetails component packet filtering', () => {
      // Simulate how DeviceDetails filters packets
      const mockPackets = [
        { packetType: 'N', alert: null },
        { packetType: 'A', alert: 'sos' },
        { packetType: 'A', alert: 'charging' },
        { packetType: 'E', alert: 'gnss_error' },
        { packetType: 'E', alert: 'no_sim' },
        { packetType: 'A', alert: 'unknown_alert' }
      ];

      // Filter alert packets (type A)
      const alertPackets = mockPackets.filter(p => p.packetType === 'A');
      alertPackets.forEach(packet => {
        const result = mapAlertErrorCode(packet.alert, 'A');
        expect(result).toBeDefined();
        expect(result.category).toBe('alert');
      });

      // Filter error packets (type E or A with error code)
      const errorPackets = mockPackets.filter(
        p => p.packetType === 'E' || (p.packetType === 'A' && p.alert && p.alert.startsWith('E'))
      );
      errorPackets.forEach(packet => {
        const result = mapAlertErrorCode(packet.alert, 'E');
        expect(result).toBeDefined();
        expect(result.category).toBe('error');
      });
    });

    it('should handle packets with missing alert field', () => {
      // Simulate packets where alert field might be missing
      const packetsWithMissingFields = [
        { packetType: 'A', alert: null },
        { packetType: 'A', alert: undefined },
        { packetType: 'E', alert: null },
        { packetType: 'E', alert: undefined },
        { packetType: 'A' }, // No alert field at all
        { packetType: 'E' }  // No alert field at all
      ];

      packetsWithMissingFields.forEach(packet => {
        const packetType = packet.packetType;
        const result = mapAlertErrorCode(packet.alert, packetType);
        
        expect(result).toBeDefined();
        expect(result.standardCode).toBe('UNKNOWN');
        expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');
      });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { mapAlertErrorCode } from './alertErrorMapper';

describe('mapAlertErrorCode', () => {
  describe('Alert Code Mappings (A100X series)', () => {
    it('should map charging alert to A1001', () => {
      const result = mapAlertErrorCode('charging', 'A');
      expect(result).toEqual({
        standardCode: 'A1001',
        description: 'Charging - Device is charging',
        category: 'alert'
      });
    });

    it('should map SOS alert to A1002', () => {
      const result = mapAlertErrorCode('sos', 'A');
      expect(result).toEqual({
        standardCode: 'A1002',
        description: 'SOS - Emergency button pressed for 5 seconds',
        category: 'alert'
      });
    });

    it('should map tampered alert to A1003', () => {
      const result = mapAlertErrorCode('tampered', 'A');
      expect(result).toEqual({
        standardCode: 'A1003',
        description: 'Tampered - Device has been tampered with',
        category: 'alert'
      });
    });

    it('should map GPS disabled alert to A1004', () => {
      const result = mapAlertErrorCode('gps_disabled', 'A');
      expect(result).toEqual({
        standardCode: 'A1004',
        description: 'GPS Disabled - Device GPS is disabled',
        category: 'alert'
      });
    });

    it('should map charger removed alert to A1005', () => {
      const result = mapAlertErrorCode('charger_removed', 'A');
      expect(result).toEqual({
        standardCode: 'A1005',
        description: 'Charger Removed - Charger has been removed from device',
        category: 'alert'
      });
    });

    it('should handle case-insensitive alert codes', () => {
      const result = mapAlertErrorCode('SOS', 'A');
      expect(result.standardCode).toBe('A1002');
    });

    it('should handle alert codes with extra whitespace', () => {
      const result = mapAlertErrorCode('  charging  ', 'A');
      expect(result.standardCode).toBe('A1001');
    });
  });

  describe('Error Code Mappings (E100X/E101X series)', () => {
    it('should map GNSS error to E1001', () => {
      const result = mapAlertErrorCode('gnss_error', 'E');
      expect(result).toEqual({
        standardCode: 'E1001',
        description: 'GNSS Connectivity - Issue in GNSS UART receiving or invalid packet',
        category: 'error'
      });
    });

    it('should map network registration error to E1002', () => {
      const result = mapAlertErrorCode('network_registration', 'E');
      expect(result).toEqual({
        standardCode: 'E1002',
        description: 'Network Registration - Device failed to register network',
        category: 'error'
      });
    });

    it('should map no data capability error to E1003', () => {
      const result = mapAlertErrorCode('no_data_capability', 'E');
      expect(result).toEqual({
        standardCode: 'E1003',
        description: 'No Data Capability - Device failed to establish data connection',
        category: 'error'
      });
    });

    it('should map poor network error to E1004', () => {
      const result = mapAlertErrorCode('poor_network', 'E');
      expect(result).toEqual({
        standardCode: 'E1004',
        description: 'Poor Network Strength - Device is under poor network strength',
        category: 'error'
      });
    });

    it('should map MQTT connection error to E1005', () => {
      const result = mapAlertErrorCode('mqtt_connection', 'E');
      expect(result).toEqual({
        standardCode: 'E1005',
        description: 'MQTT Connection - Device failed to initialize MQTT connection',
        category: 'error'
      });
    });

    it('should map FTP connection error to E1006', () => {
      const result = mapAlertErrorCode('ftp_connection', 'E');
      expect(result).toEqual({
        standardCode: 'E1006',
        description: 'FTP Connection - Device failed to initialize FTP connection',
        category: 'error'
      });
    });

    it('should map no SIM error to E1011', () => {
      const result = mapAlertErrorCode('no_sim', 'E');
      expect(result).toEqual({
        standardCode: 'E1011',
        description: 'No SIM - Device has no SIM card',
        category: 'error'
      });
    });

    it('should map microphone connection error to E1012', () => {
      const result = mapAlertErrorCode('microphone_connection', 'E');
      expect(result).toEqual({
        standardCode: 'E1012',
        description: 'Microphone Connection - Issue in microphone connection',
        category: 'error'
      });
    });

    it('should map flash memory error to E1013', () => {
      const result = mapAlertErrorCode('flash_memory', 'E');
      expect(result).toEqual({
        standardCode: 'E1013',
        description: 'Flash Memory Malfunction - Issue in flash memory',
        category: 'error'
      });
    });

    it('should handle case-insensitive error codes', () => {
      const result = mapAlertErrorCode('GNSS_ERROR', 'E');
      expect(result.standardCode).toBe('E1001');
    });

    it('should handle error codes with extra whitespace', () => {
      const result = mapAlertErrorCode('  no_sim  ', 'E');
      expect(result.standardCode).toBe('E1011');
    });
  });

  describe('Unknown Code Fallback', () => {
    it('should return fallback for unknown alert code', () => {
      const result = mapAlertErrorCode('unknown_alert', 'A');
      expect(result).toEqual({
        standardCode: 'unknown_alert',
        description: 'Unknown alert - unknown_alert',
        category: 'alert'
      });
    });

    it('should return fallback for unknown error code', () => {
      const result = mapAlertErrorCode('unknown_error', 'E');
      expect(result).toEqual({
        standardCode: 'unknown_error',
        description: 'Unknown error - unknown_error',
        category: 'error'
      });
    });

    it('should return fallback for numeric code', () => {
      const result = mapAlertErrorCode('12345', 'E');
      expect(result).toEqual({
        standardCode: '12345',
        description: 'Unknown error - 12345',
        category: 'error'
      });
    });

    it('should return fallback for special characters', () => {
      const result = mapAlertErrorCode('!@#$%', 'A');
      expect(result).toEqual({
        standardCode: '!@#$%',
        description: 'Unknown alert - !@#$%',
        category: 'alert'
      });
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle null code for alert', () => {
      const result = mapAlertErrorCode(null, 'A');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown alert',
        category: 'alert'
      });
    });

    it('should handle null code for error', () => {
      const result = mapAlertErrorCode(null, 'E');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown error',
        category: 'error'
      });
    });

    it('should handle undefined code for alert', () => {
      const result = mapAlertErrorCode(undefined, 'A');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown alert',
        category: 'alert'
      });
    });

    it('should handle undefined code for error', () => {
      const result = mapAlertErrorCode(undefined, 'E');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown error',
        category: 'error'
      });
    });

    it('should handle empty string code', () => {
      const result = mapAlertErrorCode('', 'A');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown alert',
        category: 'alert'
      });
    });

    it('should handle whitespace-only code', () => {
      const result = mapAlertErrorCode('   ', 'A');
      expect(result).toEqual({
        standardCode: 'UNKNOWN',
        description: 'Unknown alert',
        category: 'alert'
      });
    });
  });

  describe('Return Structure Validation', () => {
    it('should always return object with standardCode property', () => {
      const result = mapAlertErrorCode('charging', 'A');
      expect(result).toHaveProperty('standardCode');
      expect(typeof result.standardCode).toBe('string');
    });

    it('should always return object with description property', () => {
      const result = mapAlertErrorCode('charging', 'A');
      expect(result).toHaveProperty('description');
      expect(typeof result.description).toBe('string');
    });

    it('should always return object with category property', () => {
      const result = mapAlertErrorCode('charging', 'A');
      expect(result).toHaveProperty('category');
      expect(typeof result.category).toBe('string');
    });

    it('should return alert category for packet type A', () => {
      const result = mapAlertErrorCode('any_code', 'A');
      expect(result.category).toBe('alert');
    });

    it('should return error category for packet type E', () => {
      const result = mapAlertErrorCode('any_code', 'E');
      expect(result.category).toBe('error');
    });
  });
});

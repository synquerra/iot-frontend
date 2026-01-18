import { describe, it, expect } from 'vitest';

/**
 * Unit Tests for Settings Profile Helper Functions
 * 
 * Feature: profile-data-display
 * Tests the formatUserType and formatImeiList helper functions
 */

// Helper functions extracted from Settings.jsx for testing
const formatUserType = (userType) => {
  const typeMap = {
    'ADMIN': 'Administrator',
    'PARENTS': 'Parent'
  };
  return typeMap[userType] || userType || 'Unknown';
};

const formatImeiList = (imeis) => {
  if (!imeis || imeis.length === 0) {
    return 'No devices assigned';
  }
  if (imeis.length === 1) {
    return `1 device: ${imeis[0]}`;
  }
  return `${imeis.length} devices: ${imeis.join(', ')}`;
};

describe('Settings Profile Helper Functions - Unit Tests', () => {
  
  /**
   * Sub-task 3.1: Test formatUserType with "ADMIN" returns "Administrator"
   */
  describe('formatUserType', () => {
    it('should return "Administrator" when userType is "ADMIN"', () => {
      const result = formatUserType('ADMIN');
      expect(result).toBe('Administrator');
    });

    /**
     * Sub-task 3.2: Test formatUserType with "PARENTS" returns "Parent"
     */
    it('should return "Parent" when userType is "PARENTS"', () => {
      const result = formatUserType('PARENTS');
      expect(result).toBe('Parent');
    });

    /**
     * Sub-task 3.3: Test formatUserType with null/undefined returns "Unknown"
     */
    it('should return "Unknown" when userType is null', () => {
      const result = formatUserType(null);
      expect(result).toBe('Unknown');
    });

    it('should return "Unknown" when userType is undefined', () => {
      const result = formatUserType(undefined);
      expect(result).toBe('Unknown');
    });

    it('should return the original value when userType is an invalid/unknown type', () => {
      const result = formatUserType('INVALID');
      expect(result).toBe('INVALID');
    });
  });

  /**
   * Sub-task 3.4: Test formatImeiList with empty array returns "No devices assigned"
   * Sub-task 3.5: Test formatImeiList with single IMEI returns "1 device: {imei}"
   * Sub-task 3.6: Test formatImeiList with multiple IMEIs returns correct format
   */
  describe('formatImeiList', () => {
    it('should return "No devices assigned" when imeis array is empty', () => {
      const result = formatImeiList([]);
      expect(result).toBe('No devices assigned');
    });

    it('should return "No devices assigned" when imeis is null', () => {
      const result = formatImeiList(null);
      expect(result).toBe('No devices assigned');
    });

    it('should return "No devices assigned" when imeis is undefined', () => {
      const result = formatImeiList(undefined);
      expect(result).toBe('No devices assigned');
    });

    it('should return "1 device: {imei}" when imeis array has single element', () => {
      const result = formatImeiList(['123456789012345']);
      expect(result).toBe('1 device: 123456789012345');
    });

    it('should return "2 devices: {imei1}, {imei2}" when imeis array has two elements', () => {
      const result = formatImeiList(['111', '222']);
      expect(result).toBe('2 devices: 111, 222');
    });

    it('should return "3 devices: {imei1}, {imei2}, {imei3}" when imeis array has three elements', () => {
      const result = formatImeiList(['111', '222', '333']);
      expect(result).toBe('3 devices: 111, 222, 333');
    });

    it('should handle multiple IMEIs with correct count and comma-separated format', () => {
      const imeis = ['123456789012345', '987654321098765', '555555555555555', '444444444444444'];
      const result = formatImeiList(imeis);
      expect(result).toBe('4 devices: 123456789012345, 987654321098765, 555555555555555, 444444444444444');
    });
  });
});

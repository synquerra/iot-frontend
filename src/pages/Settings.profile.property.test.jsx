/**
 * Property-Based Tests for Settings Profile Data Display
 * 
 * Feature: profile-data-display
 * 
 * These tests verify universal properties of the profile data display
 * across many randomly generated inputs to ensure correctness.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Helper function to format user type
 * Extracted from Settings.jsx for testing
 */
const formatUserType = (userType) => {
  const typeMap = {
    'ADMIN': 'Administrator',
    'PARENTS': 'Parent'
  }
  // Use hasOwnProperty to avoid prototype pollution
  if (Object.prototype.hasOwnProperty.call(typeMap, userType)) {
    return typeMap[userType]
  }
  return userType || 'Unknown'
}

/**
 * Helper function to format IMEI list
 * Extracted from Settings.jsx for testing
 */
const formatImeiList = (imeis) => {
  if (!imeis || imeis.length === 0) {
    return 'No devices assigned'
  }
  if (imeis.length === 1) {
    return `1 device: ${imeis[0]}`
  }
  return `${imeis.length} devices: ${imeis.join(', ')}`
}

describe('Settings Profile Data Display - Property-Based Tests', () => {

  /**
   * Property 1: User Type Display Consistency
   * 
   * **Validates: Requirements 4.1, 4.2**
   * 
   * For all valid user types in the system:
   * - formatUserType("ADMIN") always returns "Administrator"
   * - formatUserType("PARENTS") always returns "Parent"
   * - formatUserType(null) returns "Unknown"
   * - formatUserType(undefined) returns "Unknown"
   * - The output is always a non-empty string
   */
  describe('Property 1: User Type Display Consistency', () => {
    
    it('should always return "Administrator" for ADMIN user type', () => {
      fc.assert(
        fc.property(
          fc.constant('ADMIN'),
          (userType) => {
            const result = formatUserType(userType);
            return result === 'Administrator';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return "Parent" for PARENTS user type', () => {
      fc.assert(
        fc.property(
          fc.constant('PARENTS'),
          (userType) => {
            const result = formatUserType(userType);
            return result === 'Parent';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return "Unknown" for null or undefined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined),
          (userType) => {
            const result = formatUserType(userType);
            return result === 'Unknown';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return the input value for unrecognized user types', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary strings that are not ADMIN or PARENTS
          fc.string().filter(s => s !== 'ADMIN' && s !== 'PARENTS' && s !== ''),
          (userType) => {
            const result = formatUserType(userType);
            return result === userType;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a non-empty string for any input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('ADMIN'),
            fc.constant('PARENTS'),
            fc.constant(null),
            fc.constant(undefined),
            fc.string()
          ),
          (userType) => {
            const result = formatUserType(userType);
            return typeof result === 'string' && result.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: IMEI List Formatting Accuracy
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * For any array of IMEI strings:
   * - If array is empty or null, output is "No devices assigned"
   * - If array has 1 element, output starts with "1 device:"
   * - If array has N elements (N > 1), output starts with "N devices:"
   * - All IMEIs in the input array appear in the output string
   * - The count in the output matches the array length
   */
  describe('Property 2: IMEI List Formatting Accuracy', () => {
    
    it('should return "No devices assigned" for empty or null arrays', () => {
      fc.assert(
        fc.property(
          fc.constantFrom([], null, undefined),
          (imeis) => {
            const result = formatImeiList(imeis);
            return result === 'No devices assigned';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should start with "1 device:" for single-element arrays', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary IMEI strings (alphanumeric, 1-20 chars)
          fc.string({ minLength: 1, maxLength: 20 }),
          (imei) => {
            const result = formatImeiList([imei]);
            return result.startsWith('1 device:');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include the IMEI value in output for single-element arrays', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (imei) => {
            const result = formatImeiList([imei]);
            return result.includes(imei);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should start with "N devices:" for N-element arrays (N > 1)', () => {
      fc.assert(
        fc.property(
          // Generate arrays of 2-10 IMEI strings
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
          (imeis) => {
            const result = formatImeiList(imeis);
            const expectedPrefix = `${imeis.length} devices:`;
            return result.startsWith(expectedPrefix);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all IMEIs in the output string', () => {
      fc.assert(
        fc.property(
          // Generate arrays of 1-10 IMEI strings
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          (imeis) => {
            const result = formatImeiList(imeis);
            // Check that every IMEI appears in the result
            return imeis.every(imei => result.includes(imei));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have count in output matching array length', () => {
      fc.assert(
        fc.property(
          // Generate arrays of 0-10 IMEI strings
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
          (imeis) => {
            const result = formatImeiList(imeis);
            
            if (imeis.length === 0) {
              return result === 'No devices assigned';
            } else if (imeis.length === 1) {
              return result.startsWith('1 device:');
            } else {
              return result.startsWith(`${imeis.length} devices:`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format multiple IMEIs with comma separation', () => {
      fc.assert(
        fc.property(
          // Generate arrays of 2-5 IMEI strings
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
          (imeis) => {
            const result = formatImeiList(imeis);
            const expectedFormat = `${imeis.length} devices: ${imeis.join(', ')}`;
            return result === expectedFormat;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a non-empty string', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant([]),
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 })
          ),
          (imeis) => {
            const result = formatImeiList(imeis);
            return typeof result === 'string' && result.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

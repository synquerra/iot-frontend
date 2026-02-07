/**
 * Property-Based Tests for Alert Error Mapper
 * 
 * Feature: device-detail-alert-error-enhancement
 * 
 * These tests verify universal properties of the alert/error code mapper
 * across many randomly generated inputs to ensure correctness.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { mapAlertErrorCode } from './alertErrorMapper.js';

describe('Alert Error Mapper - Property-Based Tests', () => {
  /**
   * Property 4: Code Mapper Return Structure
   * For any input code and packet type, the code mapper should return an object
   * with properties: standardCode (string), description (string), and category (string).
   * 
   * Feature: device-detail-alert-error-enhancement, Property 4: Code Mapper Return Structure
   * Validates: Requirements 6.2
   */
  describe('Property 4: Code Mapper Return Structure', () => {
    it('should always return an object with standardCode, description, and category properties', async () => {
      await fc.assert(
        fc.property(
          // Generate random codes (strings, numbers, null, undefined, empty strings)
          fc.oneof(
            fc.string(),
            fc.integer().map(n => String(n)),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.string({ minLength: 1, maxLength: 50 })
          ),
          // Generate packet types (A or E)
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper
            const result = mapAlertErrorCode(code, packetType);

            // Verify the result is an object
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result).not.toBeNull();

            // Verify all required properties exist
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify all properties are strings
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify standardCode is not empty
            expect(result.standardCode.length).toBeGreaterThan(0);

            // Verify description is not empty
            expect(result.description.length).toBeGreaterThan(0);

            // Verify category is either 'alert' or 'error'
            expect(['alert', 'error']).toContain(result.category);

            // Verify category matches packet type
            if (packetType === 'A') {
              expect(result.category).toBe('alert');
            } else if (packetType === 'E') {
              expect(result.category).toBe('error');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for known alert codes', async () => {
      await fc.assert(
        fc.property(
          // Generate known alert codes
          fc.constantFrom('charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed'),
          (code) => {
            const result = mapAlertErrorCode(code, 'A');

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify category is 'alert'
            expect(result.category).toBe('alert');

            // Verify standardCode follows A100X format
            expect(result.standardCode).toMatch(/^A100[1-5]$/);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for known error codes', async () => {
      await fc.assert(
        fc.property(
          // Generate known error codes
          fc.constantFrom(
            'gnss_error',
            'network_registration',
            'no_data_capability',
            'poor_network',
            'mqtt_connection',
            'ftp_connection',
            'no_sim',
            'microphone_connection',
            'flash_memory'
          ),
          (code) => {
            const result = mapAlertErrorCode(code, 'E');

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify category is 'error'
            expect(result.category).toBe('error');

            // Verify standardCode follows E100X or E101X format
            expect(result.standardCode).toMatch(/^E10[01][0-9]$/);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for unknown codes', async () => {
      await fc.assert(
        fc.property(
          // Generate random unknown codes
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            // Filter out known codes
            code => !['charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed',
                      'gnss_error', 'network_registration', 'no_data_capability',
                      'poor_network', 'mqtt_connection', 'ftp_connection',
                      'no_sim', 'microphone_connection', 'flash_memory'].includes(code.toLowerCase().trim())
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify category matches packet type
            expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for null/undefined codes', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom(null, undefined),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify standardCode is 'UNKNOWN'
            expect(result.standardCode).toBe('UNKNOWN');

            // Verify category matches packet type
            expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for empty string codes', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify standardCode is 'UNKNOWN'
            expect(result.standardCode).toBe('UNKNOWN');

            // Verify category matches packet type
            expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for numeric codes', async () => {
      await fc.assert(
        fc.property(
          fc.integer(),
          fc.constantFrom('A', 'E'),
          (numericCode, packetType) => {
            const code = String(numericCode);
            const result = mapAlertErrorCode(code, packetType);

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify category matches packet type
            expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent structure for codes with special characters', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '!@#$%'),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify structure
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify types
            expect(typeof result.standardCode).toBe('string');
            expect(typeof result.description).toBe('string');
            expect(typeof result.category).toBe('string');

            // Verify category matches packet type
            expect(result.category).toBe(packetType === 'A' ? 'alert' : 'error');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never return additional properties beyond standardCode, description, and category', async () => {
      await fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.constant(null),
            fc.constant(undefined)
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify only expected properties exist
            const keys = Object.keys(result);
            expect(keys).toHaveLength(3);
            expect(keys).toContain('standardCode');
            expect(keys).toContain('description');
            expect(keys).toContain('category');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Code Mapper Purity
   * For any given input code and packet type, calling the code mapper multiple times
   * should return identical results (deep equality).
   * 
   * Feature: device-detail-alert-error-enhancement, Property 5: Code Mapper Purity
   * Validates: Requirements 6.4
   */
  describe('Property 5: Code Mapper Purity', () => {
    it('should return identical results for the same inputs across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate random codes (strings, numbers, null, undefined, empty strings)
          fc.oneof(
            fc.string(),
            fc.integer().map(n => String(n)),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.string({ minLength: 1, maxLength: 50 })
          ),
          // Generate packet types (A or E)
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper multiple times with the same inputs
            const result1 = mapAlertErrorCode(code, packetType);
            const result2 = mapAlertErrorCode(code, packetType);
            const result3 = mapAlertErrorCode(code, packetType);

            // Verify deep equality between all results
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
            expect(result1).toEqual(result3);

            // Verify each property is identical
            expect(result1.standardCode).toBe(result2.standardCode);
            expect(result1.description).toBe(result2.description);
            expect(result1.category).toBe(result2.category);

            expect(result2.standardCode).toBe(result3.standardCode);
            expect(result2.description).toBe(result3.description);
            expect(result2.category).toBe(result3.category);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for known alert codes across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate known alert codes
          fc.constantFrom('charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed'),
          (code) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, 'A');
            const result2 = mapAlertErrorCode(code, 'A');
            const result3 = mapAlertErrorCode(code, 'A');

            // Verify deep equality
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);

            // Verify standardCode is identical
            expect(result1.standardCode).toBe(result2.standardCode);
            expect(result2.standardCode).toBe(result3.standardCode);

            // Verify description is identical
            expect(result1.description).toBe(result2.description);
            expect(result2.description).toBe(result3.description);

            // Verify category is identical
            expect(result1.category).toBe(result2.category);
            expect(result2.category).toBe(result3.category);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for known error codes across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate known error codes
          fc.constantFrom(
            'gnss_error',
            'network_registration',
            'no_data_capability',
            'poor_network',
            'mqtt_connection',
            'ftp_connection',
            'no_sim',
            'microphone_connection',
            'flash_memory'
          ),
          (code) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, 'E');
            const result2 = mapAlertErrorCode(code, 'E');
            const result3 = mapAlertErrorCode(code, 'E');

            // Verify deep equality
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);

            // Verify standardCode is identical
            expect(result1.standardCode).toBe(result2.standardCode);
            expect(result2.standardCode).toBe(result3.standardCode);

            // Verify description is identical
            expect(result1.description).toBe(result2.description);
            expect(result2.description).toBe(result3.description);

            // Verify category is identical
            expect(result1.category).toBe(result2.category);
            expect(result2.category).toBe(result3.category);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for unknown codes across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate random unknown codes
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            // Filter out known codes
            code => !['charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed',
                      'gnss_error', 'network_registration', 'no_data_capability',
                      'poor_network', 'mqtt_connection', 'ftp_connection',
                      'no_sim', 'microphone_connection', 'flash_memory'].includes(code.toLowerCase().trim())
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, packetType);
            const result2 = mapAlertErrorCode(code, packetType);
            const result3 = mapAlertErrorCode(code, packetType);

            // Verify deep equality
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);

            // Verify each property is identical
            expect(result1.standardCode).toBe(result2.standardCode);
            expect(result1.description).toBe(result2.description);
            expect(result1.category).toBe(result2.category);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for null/undefined codes across multiple calls', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom(null, undefined),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, packetType);
            const result2 = mapAlertErrorCode(code, packetType);
            const result3 = mapAlertErrorCode(code, packetType);

            // Verify deep equality
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);

            // Verify standardCode is 'UNKNOWN' in all calls
            expect(result1.standardCode).toBe('UNKNOWN');
            expect(result2.standardCode).toBe('UNKNOWN');
            expect(result3.standardCode).toBe('UNKNOWN');

            // Verify description is identical
            expect(result1.description).toBe(result2.description);
            expect(result2.description).toBe(result3.description);

            // Verify category is identical
            expect(result1.category).toBe(result2.category);
            expect(result2.category).toBe(result3.category);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for case variations across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate known codes with case variations
          fc.constantFrom('charging', 'CHARGING', 'Charging', 'ChArGiNg'),
          (code) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, 'A');
            const result2 = mapAlertErrorCode(code, 'A');

            // Verify deep equality
            expect(result1).toEqual(result2);

            // All case variations should map to the same standardCode
            expect(result1.standardCode).toBe('A1001');
            expect(result2.standardCode).toBe('A1001');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return identical results for codes with whitespace variations across multiple calls', async () => {
      await fc.assert(
        fc.property(
          // Generate known codes with whitespace variations
          fc.constantFrom('sos', ' sos', 'sos ', ' sos ', '  sos  '),
          (code) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, 'A');
            const result2 = mapAlertErrorCode(code, 'A');

            // Verify deep equality
            expect(result1).toEqual(result2);

            // All whitespace variations should map to the same standardCode
            expect(result1.standardCode).toBe('A1002');
            expect(result2.standardCode).toBe('A1002');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate input parameters', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Store original values
            const originalCode = code;
            const originalPacketType = packetType;

            // Call the mapper
            mapAlertErrorCode(code, packetType);

            // Verify inputs are unchanged
            expect(code).toBe(originalCode);
            expect(packetType).toBe(originalPacketType);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return new object instances on each call (not cached references)', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom('charging', 'sos', 'gnss_error', 'no_sim'),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper multiple times
            const result1 = mapAlertErrorCode(code, packetType);
            const result2 = mapAlertErrorCode(code, packetType);

            // Verify results are equal but not the same reference
            expect(result1).toEqual(result2);
            expect(result1).not.toBe(result2);

            // Verify modifying one result doesn't affect the other
            result1.testProperty = 'test';
            expect(result2).not.toHaveProperty('testProperty');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Unknown Code Fallback
   * For any backend code that doesn't match the known mapping tables, the code mapper
   * should return the original code as standardCode with a generic description, without throwing errors.
   * 
   * Feature: device-detail-alert-error-enhancement, Property 6: Unknown Code Fallback
   * Validates: Requirements 6.3, 8.1, 8.3
   */
  describe('Property 6: Unknown Code Fallback', () => {
    it('should return original code as standardCode for unknown codes without throwing errors', async () => {
      await fc.assert(
        fc.property(
          // Generate random unknown codes (filter out known codes and whitespace-only strings)
          fc.string({ minLength: 1, maxLength: 100 }).filter(
            code => {
              const normalized = code.toLowerCase().trim();
              // Filter out empty/whitespace-only strings (these are handled as UNKNOWN)
              if (normalized === '') return false;
              
              const knownCodes = [
                'charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed',
                'gnss_error', 'network_registration', 'no_data_capability',
                'poor_network', 'mqtt_connection', 'ftp_connection',
                'no_sim', 'microphone_connection', 'flash_memory'
              ];
              return !knownCodes.includes(normalized);
            }
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();
            expect(result).not.toBeNull();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            // Verify description contains the original code
            expect(result.description).toContain(code);

            // Verify category matches packet type
            const expectedCategory = packetType === 'A' ? 'alert' : 'error';
            expect(result.category).toBe(expectedCategory);

            // Verify description contains the category
            expect(result.description).toContain(expectedCategory);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle numeric unknown codes without throwing errors', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: 1000000 }).map(n => String(n)),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            // Verify description contains the code
            expect(result.description).toContain(code);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special character codes without throwing errors', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '!@#$%^&*()'),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very long unknown codes without throwing errors', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle unicode and emoji codes without throwing errors', async () => {
      await fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('🚨'),
            fc.constant('⚠️'),
            fc.constant('中文代码'),
            fc.constant('العربية'),
            fc.constant('日本語'),
            fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '🔥')
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle codes with mixed case that do not match known codes', async () => {
      await fc.assert(
        fc.property(
          // Generate codes that are similar to known codes but not exact matches
          fc.constantFrom(
            'CHARGING_NEW',
            'sos_button',
            'tamper_alert',
            'gnss_fail',
            'network_error_new'
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is the original code
            expect(result.standardCode).toBe(code);

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return generic description format for unknown codes', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            code => {
              const normalized = code.toLowerCase().trim();
              const knownCodes = [
                'charging', 'sos', 'tampered', 'gps_disabled', 'charger_removed',
                'gnss_error', 'network_registration', 'no_data_capability',
                'poor_network', 'mqtt_connection', 'ftp_connection',
                'no_sim', 'microphone_connection', 'flash_memory'
              ];
              return !knownCodes.includes(normalized);
            }
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            const result = mapAlertErrorCode(code, packetType);

            // Verify description follows the format: "Unknown {category} - {code}"
            const expectedCategory = packetType === 'A' ? 'alert' : 'error';
            const expectedDescription = `Unknown ${expectedCategory} - ${code}`;
            expect(result.description).toBe(expectedDescription);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null and undefined codes with UNKNOWN standardCode', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom(null, undefined),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is 'UNKNOWN' (not the original null/undefined)
            expect(result.standardCode).toBe('UNKNOWN');

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            // Verify category matches packet type
            const expectedCategory = packetType === 'A' ? 'alert' : 'error';
            expect(result.category).toBe(expectedCategory);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty and whitespace-only codes with UNKNOWN standardCode', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n', '\r\n', '  \t  \n  '),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify standardCode is 'UNKNOWN' (not the original empty/whitespace)
            expect(result.standardCode).toBe('UNKNOWN');

            // Verify description contains "Unknown"
            expect(result.description).toContain('Unknown');

            // Verify category matches packet type
            const expectedCategory = packetType === 'A' ? 'alert' : 'error';
            expect(result.category).toBe(expectedCategory);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never throw errors for any input combination', async () => {
      await fc.assert(
        fc.property(
          // Generate any possible input
          fc.oneof(
            fc.string(),
            fc.integer().map(n => String(n)),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.constant({}),
            fc.constant([]),
            fc.constant(true),
            fc.constant(false)
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should never throw
            expect(() => {
              mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain backward compatibility with legacy codes', async () => {
      await fc.assert(
        fc.property(
          // Generate legacy-style codes (numbers, uppercase, etc.)
          fc.oneof(
            fc.integer({ min: 1, max: 9999 }).map(n => String(n)),
            fc.constantFrom('LEGACY_ALERT', 'OLD_ERROR', 'DEPRECATED_CODE'),
            fc.string({ minLength: 1, maxLength: 20 }).map(s => s.toUpperCase())
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // Verify result has all required properties
            expect(result).toHaveProperty('standardCode');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('category');

            // Verify standardCode is a string
            expect(typeof result.standardCode).toBe('string');

            // Verify description is a string
            expect(typeof result.description).toBe('string');

            // Verify category matches packet type
            const expectedCategory = packetType === 'A' ? 'alert' : 'error';
            expect(result.category).toBe(expectedCategory);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle codes that are substrings of known codes', async () => {
      await fc.assert(
        fc.property(
          // Generate codes that are substrings or superstrings of known codes
          fc.constantFrom(
            'charg',           // substring of 'charging'
            'charging_extra',  // superstring of 'charging'
            'so',              // substring of 'sos'
            'sos_new',         // superstring of 'sos'
            'gnss',            // substring of 'gnss_error'
            'gnss_error_new'   // superstring of 'gnss_error'
          ),
          fc.constantFrom('A', 'E'),
          (code, packetType) => {
            // Call the mapper - should not throw
            let result;
            expect(() => {
              result = mapAlertErrorCode(code, packetType);
            }).not.toThrow();

            // Verify result is defined
            expect(result).toBeDefined();

            // These should be treated as unknown codes
            expect(result.standardCode).toBe(code);
            expect(result.description).toContain('Unknown');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

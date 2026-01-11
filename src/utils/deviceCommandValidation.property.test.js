/**
 * Property-Based Tests for Device Command Validation
 * 
 * Feature: device-command-api
 * 
 * These tests verify universal properties of the validation module across
 * many randomly generated inputs to ensure correctness.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateIMEI, validateCommand, validateParams } from './deviceCommandValidation.js';
import { COMMANDS } from './deviceCommandConstants.js';

describe('Device Command Validation - Property-Based Tests', () => {
  /**
   * Property 5: Universal IMEI Validation
   * For any command type, if the IMEI is missing or invalid, the API should return
   * a validation error before making any HTTP request.
   * 
   * Feature: device-command-api, Property 5: Universal IMEI Validation
   * Validates: Requirements 2.2, 3.3, 9.5
   */
  describe('Property 5: Universal IMEI Validation', () => {
    it('should reject missing or empty IMEI values', async () => {
      await fc.assert(
        fc.property(
          // Generate invalid IMEI values: null, undefined, empty string, whitespace-only strings
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t'),
            fc.constant('\n'),
            fc.constant('  \t\n  ')
          ),
          (invalidIMEI) => {
            // Validate the invalid IMEI
            const result = validateIMEI(invalidIMEI);

            // Should return invalid result
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string IMEI values', async () => {
      await fc.assert(
        fc.property(
          // Generate non-string values: numbers, objects, arrays, booleans
          fc.oneof(
            fc.integer(),
            fc.float(),
            fc.object(),
            fc.array(fc.anything()),
            fc.boolean()
          ),
          (nonStringIMEI) => {
            // Validate the non-string IMEI
            const result = validateIMEI(nonStringIMEI);

            // Should return invalid result
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept any non-empty string as valid IMEI', async () => {
      await fc.assert(
        fc.property(
          // Generate valid IMEI values: any non-empty string
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          (validIMEI) => {
            // Validate the valid IMEI
            const result = validateIMEI(validIMEI);

            // Should return valid result
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should consistently validate the same IMEI value', async () => {
      await fc.assert(
        fc.property(
          // Generate any IMEI value (valid or invalid)
          fc.oneof(
            fc.string(),
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.boolean()
          ),
          (imei) => {
            // Validate the same IMEI twice
            const result1 = validateIMEI(imei);
            const result2 = validateIMEI(imei);

            // Results should be identical
            expect(result1.valid).toBe(result2.valid);
            expect(result1.error).toBe(result2.error);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate IMEI independently of command type', async () => {
      await fc.assert(
        fc.property(
          // Generate random IMEI and command type
          fc.oneof(
            fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            fc.constant(''),
            fc.constant(null)
          ),
          fc.constantFrom(...Object.values(COMMANDS)),
          (imei, command) => {
            // Validate IMEI
            const imeiResult = validateIMEI(imei);

            // IMEI validation should not depend on command type
            // The result should be the same regardless of which command we're validating for
            // Check if IMEI is valid: must be a string, non-null, and non-empty after trimming
            const expectedValid = typeof imei === 'string' && imei.trim().length > 0;
            expect(imeiResult.valid).toBe(expectedValid);

            if (!expectedValid) {
              expect(imeiResult.error).toBeDefined();
            } else {
              expect(imeiResult.error).toBeUndefined();
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

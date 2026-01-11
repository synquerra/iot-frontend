/**
 * Property-Based Tests for Device Command HTTP Client
 * 
 * Feature: device-command-api
 * 
 * These tests verify universal properties of the HTTP client module across
 * many randomly generated inputs to ensure correctness.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatRequest } from './deviceCommandHTTP.js';
import { COMMANDS } from './deviceCommandConstants.js';

describe('Device Command HTTP Client - Property-Based Tests', () => {
  /**
   * Property 2: Parameter Preservation
   * For any command with parameters, all specified params should be included
   * in the request payload without modification.
   * 
   * Feature: device-command-api, Property 2: Parameter Preservation
   * Validates: Requirements 1.2, 6.1
   */
  describe('Property 2: Parameter Preservation', () => {
    it('should preserve all parameters in the request payload without modification', async () => {
      await fc.assert(
        fc.property(
          // Generate random IMEI (non-empty string)
          fc.string({ minLength: 1, maxLength: 20 }),
          // Generate random command from supported commands
          fc.constantFrom(...Object.values(COMMANDS)),
          // Generate random params object with various types of values
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 30 }), // keys
            fc.oneof(
              fc.string(),
              fc.integer(),
              fc.float(),
              fc.boolean(),
              fc.array(fc.anything()),
              fc.object(),
              fc.constant(null)
            ) // values
          ),
          (imei, command, params) => {
            // Format the request
            const request = formatRequest(imei, command, params);

            // Verify the request structure
            expect(request).toBeDefined();
            expect(request).toHaveProperty('imei');
            expect(request).toHaveProperty('command');
            expect(request).toHaveProperty('params');

            // Verify IMEI is preserved
            expect(request.imei).toBe(imei);

            // Verify command is preserved
            expect(request.command).toBe(command);

            // Verify params object is preserved without modification
            expect(request.params).toBe(params); // Should be the exact same reference

            // Verify all param keys are preserved
            const paramKeys = Object.keys(params);
            const requestParamKeys = Object.keys(request.params);
            expect(requestParamKeys).toEqual(paramKeys);

            // Verify all param values are preserved
            for (const key of paramKeys) {
              expect(request.params[key]).toBe(params[key]);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve empty params object', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...Object.values(COMMANDS)),
          (imei, command) => {
            const emptyParams = {};
            const request = formatRequest(imei, command, emptyParams);

            // Verify empty params is preserved
            expect(request.params).toBe(emptyParams);
            expect(Object.keys(request.params)).toHaveLength(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve nested object structures in params', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...Object.values(COMMANDS)),
          // Generate params with nested structures
          fc.record({
            simple: fc.string(),
            nested: fc.record({
              level1: fc.string(),
              level2: fc.record({
                deep: fc.integer()
              })
            }),
            array: fc.array(fc.integer())
          }),
          (imei, command, params) => {
            const request = formatRequest(imei, command, params);

            // Verify nested structures are preserved
            expect(request.params).toBe(params);
            expect(request.params.simple).toBe(params.simple);
            expect(request.params.nested).toBe(params.nested);
            expect(request.params.nested.level1).toBe(params.nested.level1);
            expect(request.params.nested.level2).toBe(params.nested.level2);
            expect(request.params.nested.level2.deep).toBe(params.nested.level2.deep);
            expect(request.params.array).toBe(params.array);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve special parameter values', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...Object.values(COMMANDS)),
          // Generate params with special values
          fc.oneof(
            fc.constant({ value: null }),
            fc.constant({ value: undefined }),
            fc.constant({ value: 0 }),
            fc.constant({ value: '' }),
            fc.constant({ value: false }),
            fc.constant({ value: [] }),
            fc.constant({ value: {} })
          ),
          (imei, command, params) => {
            const request = formatRequest(imei, command, params);

            // Verify special values are preserved exactly
            expect(request.params).toBe(params);
            expect(request.params.value).toBe(params.value);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve params for all command types', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...Object.values(COMMANDS)),
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.string()
          ),
          (imei, command, params) => {
            const request = formatRequest(imei, command, params);

            // Verify params are preserved regardless of command type
            expect(request.params).toBe(params);
            expect(request.command).toBe(command);

            // Verify all keys and values match
            for (const [key, value] of Object.entries(params)) {
              expect(request.params[key]).toBe(value);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate the original params object', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...Object.values(COMMANDS)),
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.string()
          ),
          (imei, command, params) => {
            // Create a deep copy to compare against
            const originalParams = JSON.parse(JSON.stringify(params));
            const originalKeys = Object.keys(params);

            // Format the request
            formatRequest(imei, command, params);

            // Verify original params object is not mutated
            expect(Object.keys(params)).toEqual(originalKeys);
            for (const key of originalKeys) {
              expect(params[key]).toBe(originalParams[key]);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Property-Based Tests for Auth Response Parser
 * 
 * Feature: user-based-device-filtering
 * Validates: Requirements 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 7.1, 7.2
 * 
 * Tests universal properties for IMEI parsing, validation, and filtering logic.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { 
  validateIMEI, 
  parseIMEIString, 
  parseAuthResponse,
  persistUserContext,
  loadUserContext,
  clearPersistedContext
} from './authResponseParser.js';

describe('Auth Response Parser - Property-Based Tests', () => {
  /**
   * Property 1: IMEI Parsing Consistency
   * For any authentication response containing an IMEI field, parsing the IMEI string
   * should produce an array where each element is a non-empty string.
   * 
   * Feature: user-based-device-filtering, Property 1: IMEI Parsing Consistency
   * Validates: Requirements 1.2, 1.3, 1.4
   */
  it('should parse any IMEI string into an array of non-empty strings', () => {
    fc.assert(
      fc.property(
        // Generate various IMEI string formats
        fc.oneof(
          // Single IMEI
          fc.string({ minLength: 1, maxLength: 20 }),
          // Comma-separated IMEIs
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
            .map(arr => arr.join(',')),
          // IMEIs with whitespace
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
            .map(arr => arr.map(s => `  ${s}  `).join(',')),
          // Mixed whitespace and commas
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
            .map(arr => arr.join(' , '))
        ),
        (imeiString) => {
          const result = parseIMEIString(imeiString);
          
          // Result must be an array
          expect(Array.isArray(result)).toBe(true);
          
          // Each element must be a non-empty string
          result.forEach(imei => {
            expect(typeof imei).toBe('string');
            expect(imei.length).toBeGreaterThan(0);
            // Should not contain whitespace (trimmed)
            expect(imei).toBe(imei.trim());
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: IMEI Validation Format
   * For any IMEI string in the parsed array, if it passes validation,
   * it must contain exactly 15 numeric characters.
   * 
   * Feature: user-based-device-filtering, Property 2: IMEI Validation Format
   * Validates: Requirements 6.1, 6.2
   */
  it('should only validate IMEIs with exactly 15 numeric digits', () => {
    fc.assert(
      fc.property(
        // Generate various string formats
        fc.oneof(
          // Valid 15-digit IMEIs
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          // Invalid: wrong length
          fc.string({ minLength: 1, maxLength: 30 })
            .filter(s => s.length !== 15),
          // Invalid: contains non-numeric
          fc.string({ minLength: 15, maxLength: 15 })
            .filter(s => !/^\d+$/.test(s)),
          // Valid with whitespace (should be trimmed and valid)
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => `  ${arr.join('')}  `)
        ),
        (imeiString) => {
          const isValid = validateIMEI(imeiString);
          
          if (isValid) {
            // If validation passes, must be exactly 15 numeric digits (after trimming)
            const trimmed = imeiString.trim();
            expect(trimmed.length).toBe(15);
            expect(/^\d{15}$/.test(trimmed)).toBe(true);
          } else {
            // If validation fails, must not be 15 numeric digits
            const trimmed = typeof imeiString === 'string' ? imeiString.trim() : '';
            const is15Digits = trimmed.length === 15 && /^\d{15}$/.test(trimmed);
            expect(is15Digits).toBe(false);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Invalid IMEI Exclusion
   * For any IMEI string that fails validation (non-numeric or not 15 digits),
   * it should not appear in the final list of allowed IMEIs used for filtering.
   * 
   * Feature: user-based-device-filtering, Property 5: Invalid IMEI Exclusion
   * Validates: Requirements 6.3
   */
  it('should exclude invalid IMEIs from the parsed auth response', () => {
    fc.assert(
      fc.property(
        // Generate auth responses with mixed valid and invalid IMEIs
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          }),
          lastLoginAt: fc.constant('2024-01-01T00:00:00Z'),
          // Mix of valid and invalid IMEIs
          imei: fc.oneof(
            // All valid IMEIs
            fc.array(
              fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
                .map(arr => arr.join('')),
              { minLength: 1, maxLength: 3 }
            ).map(arr => arr.join(',')),
            // Mix of valid and invalid
            fc.tuple(
              fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
                .map(arr => arr.join('')),
              fc.string({ minLength: 1, maxLength: 10 }), // Invalid: too short
              fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
                .map(arr => arr.join(''))
            ).map(arr => arr.join(',')),
            // All invalid IMEIs
            fc.array(
              fc.string({ minLength: 1, maxLength: 14 }),
              { minLength: 1, maxLength: 3 }
            ).map(arr => arr.join(','))
          )
        }),
        (authResponse) => {
          const result = parseAuthResponse(authResponse);
          
          // Result must have imeis array
          expect(Array.isArray(result.imeis)).toBe(true);
          
          // Every IMEI in the result must be valid
          result.imeis.forEach(imei => {
            expect(validateIMEI(imei)).toBe(true);
            expect(imei.length).toBe(15);
            expect(/^\d{15}$/.test(imei)).toBe(true);
          });
          
          // Parse the original IMEI string to check exclusion
          const parsedIMEIs = parseIMEIString(authResponse.imei);
          const invalidIMEIs = parsedIMEIs.filter(imei => !validateIMEI(imei));
          
          // Invalid IMEIs should not appear in the result
          invalidIMEIs.forEach(invalidIMEI => {
            expect(result.imeis).not.toContain(invalidIMEI);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Empty IMEI string handling
   * For any empty or whitespace-only IMEI string, parsing should return an empty array.
   */
  it('should return empty array for empty or whitespace-only IMEI strings', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t\n'),
          fc.string().filter(s => s.trim() === '')
        ),
        (emptyString) => {
          const result = parseIMEIString(emptyString);
          expect(result).toEqual([]);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: IMEI parsing preserves valid IMEIs
   * For any comma-separated string of valid IMEIs, all valid IMEIs should be preserved.
   */
  it('should preserve all valid IMEIs when parsing comma-separated strings', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 1, maxLength: 5 }
        ),
        (validIMEIs) => {
          const imeiString = validIMEIs.join(',');
          const parsed = parseIMEIString(imeiString);
          
          // Should have same number of IMEIs
          expect(parsed.length).toBe(validIMEIs.length);
          
          // Each valid IMEI should be in the parsed result
          validIMEIs.forEach(imei => {
            expect(parsed).toContain(imei);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Case sensitivity
   * IMEI validation should handle numeric strings consistently regardless of input format.
   */
  it('should handle numeric strings consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 }),
        (digits) => {
          const imei = digits.join('');
          
          // Should always validate as true for 15 numeric digits
          expect(validateIMEI(imei)).toBe(true);
          
          // Should parse correctly
          const parsed = parseIMEIString(imei);
          expect(parsed).toEqual([imei]);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: User Context Persistence Round Trip
   * For any valid user context, storing it to persistent storage and then loading it back
   * should produce an equivalent user context with the same userType and IMEI list.
   * 
   * Feature: user-based-device-filtering, Property 6: User Context Persistence Round Trip
   * Validates: Requirements 7.1, 7.2
   */
  describe('Persistence Round Trip', () => {
    // Clean up storage before and after each test
    beforeEach(() => {
      clearPersistedContext();
    });

    afterEach(() => {
      clearPersistedContext();
    });

    it('should preserve user context through persist and load cycle', () => {
      fc.assert(
        fc.property(
          // Generate valid user contexts
          fc.record({
            uniqueId: fc.string({ minLength: 1, maxLength: 50 }),
            userType: fc.constantFrom('PARENTS', 'ADMIN'),
            email: fc.emailAddress(),
            tokens: fc.record({
              accessToken: fc.string({ minLength: 10, maxLength: 100 }),
              refreshToken: fc.string({ minLength: 10, maxLength: 100 })
            }),
            lastLoginAt: fc.date().map(d => d.toISOString()),
            // Generate valid IMEIs only
            imeis: fc.array(
              fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
                .map(arr => arr.join('')),
              { minLength: 0, maxLength: 5 }
            )
          }),
          (userContext) => {
            // Persist the user context
            const persistResult = persistUserContext(userContext);
            expect(persistResult).toBe(true);
            
            // Load the user context back
            const loadedContext = loadUserContext();
            
            // Should successfully load
            expect(loadedContext).not.toBeNull();
            
            if (loadedContext) {
              // Verify critical fields are preserved
              expect(loadedContext.uniqueId).toBe(userContext.uniqueId);
              expect(loadedContext.userType).toBe(userContext.userType);
              expect(loadedContext.email).toBe(userContext.email);
              
              // Verify IMEI array is preserved (order and content)
              expect(Array.isArray(loadedContext.imeis)).toBe(true);
              expect(loadedContext.imeis.length).toBe(userContext.imeis.length);
              
              // Check each IMEI is preserved
              userContext.imeis.forEach((imei, index) => {
                expect(loadedContext.imeis[index]).toBe(imei);
              });
              
              // Note: tokens are intentionally not persisted in the storage
              // (they're managed separately), so we expect tokens to be null
              expect(loadedContext.tokens).toBeNull();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty IMEI arrays in persistence round trip', () => {
      fc.assert(
        fc.property(
          fc.record({
            uniqueId: fc.string({ minLength: 1, maxLength: 50 }),
            userType: fc.constantFrom('PARENTS', 'ADMIN'),
            email: fc.emailAddress(),
            tokens: fc.record({
              accessToken: fc.string({ minLength: 10, maxLength: 100 }),
              refreshToken: fc.string({ minLength: 10, maxLength: 100 })
            }),
            lastLoginAt: fc.date().map(d => d.toISOString()),
            imeis: fc.constant([]) // Empty IMEI array
          }),
          (userContext) => {
            const persistResult = persistUserContext(userContext);
            expect(persistResult).toBe(true);
            
            const loadedContext = loadUserContext();
            expect(loadedContext).not.toBeNull();
            
            if (loadedContext) {
              expect(loadedContext.imeis).toEqual([]);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain IMEI array integrity across multiple persist/load cycles', () => {
      fc.assert(
        fc.property(
          fc.record({
            uniqueId: fc.string({ minLength: 1, maxLength: 50 }),
            userType: fc.constantFrom('PARENTS', 'ADMIN'),
            email: fc.emailAddress(),
            tokens: fc.record({
              accessToken: fc.string({ minLength: 10, maxLength: 100 }),
              refreshToken: fc.string({ minLength: 10, maxLength: 100 })
            }),
            lastLoginAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
            imeis: fc.array(
              fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
                .map(arr => arr.join('')),
              { minLength: 1, maxLength: 3 }
            )
          }),
          (userContext) => {
            // First cycle
            persistUserContext(userContext);
            const loaded1 = loadUserContext();
            expect(loaded1).not.toBeNull();
            
            // Second cycle - persist the loaded context
            if (loaded1) {
              // Add tokens back for persistence (they're required)
              const contextWithTokens = {
                ...loaded1,
                tokens: userContext.tokens
              };
              
              persistUserContext(contextWithTokens);
              const loaded2 = loadUserContext();
              expect(loaded2).not.toBeNull();
              
              if (loaded2) {
                // Should still match original
                expect(loaded2.uniqueId).toBe(userContext.uniqueId);
                expect(loaded2.userType).toBe(userContext.userType);
                expect(loaded2.imeis).toEqual(userContext.imeis);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

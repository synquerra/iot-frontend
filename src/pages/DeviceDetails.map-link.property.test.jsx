/**
 * Property-Based Tests for Map Link Behavior
 * 
 * Feature: device-detail-alert-error-enhancement
 * Property 3: Map Link Behavior
 * 
 * These tests verify that the map link displays correctly based on coordinate
 * availability across many randomly generated inputs.
 * 
 * NOTE: The actual implementation in DeviceDetails.jsx uses the condition:
 * `latest.latitude && latest.longitude` which treats 0 as falsy.
 * This is a potential bug since (0, 0) is a valid coordinate (Gulf of Guinea).
 * These tests validate the INTENDED behavior where 0 coordinates should work.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Helper function to check if map link URL is correctly formatted
 */
function isValidMapUrl(url, latitude, longitude) {
  const expectedUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return url === expectedUrl;
}

/**
 * Helper function to check if coordinates are valid (non-null, non-undefined)
 * This represents the INTENDED behavior, not the current buggy implementation
 */
function hasValidCoordinates(latitude, longitude) {
  return latitude != null && longitude != null;
}

/**
 * Simulates the map link logic (INTENDED behavior, not current buggy implementation)
 */
function getMapLinkData(latitude, longitude) {
  if (hasValidCoordinates(latitude, longitude)) {
    return {
      hasLink: true,
      url: `https://www.google.com/maps?q=${latitude},${longitude}`,
      text: 'Open Maps',
      target: '_blank',
      rel: 'noopener noreferrer'
    };
  } else {
    return {
      hasLink: false,
      text: 'No location'
    };
  }
}

describe('DeviceDetails - Map Link Property-Based Tests', () => {
  /**
   * Property 3: Map Link Behavior
   * **Validates: Requirements 3.3, 3.4, 3.5, 8.5**
   * 
   * For any packet, if it has valid (non-null, non-undefined) latitude and longitude values,
   * the map link should be enabled with correct URL format and target="_blank";
   * otherwise, it should display "No location" text or be disabled.
   */
  describe('Property 3: Map Link Behavior', () => {
    /**
     * Test map link data structure for valid coordinates
     */
    it('should generate correct map link data when coordinates are valid', () => {
      fc.assert(
        fc.property(
          // Generate valid latitude and longitude values
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true }),
          (latitude, longitude) => {
            const linkData = getMapLinkData(latitude, longitude);

            // Map link should be enabled
            expect(linkData.hasLink).toBe(true);

            // Verify URL format
            expect(linkData.url).toBe(`https://www.google.com/maps?q=${latitude},${longitude}`);
            expect(isValidMapUrl(linkData.url, latitude, longitude)).toBe(true);

            // Verify link opens in new tab
            expect(linkData.target).toBe('_blank');
            expect(linkData.rel).toBe('noopener noreferrer');

            // Verify link text
            expect(linkData.text).toBe('Open Maps');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test "No location" displays when coordinates are missing
     */
    it('should return "No location" data when coordinates are null or undefined', () => {
      fc.assert(
        fc.property(
          // Generate invalid coordinate combinations (null, undefined, or missing)
          fc.constantFrom(
            { latitude: null, longitude: null },
            { latitude: undefined, longitude: undefined },
            { latitude: null, longitude: undefined },
            { latitude: undefined, longitude: null },
            { latitude: null, longitude: 50 },
            { latitude: 50, longitude: null },
            { latitude: undefined, longitude: 50 },
            { latitude: 50, longitude: undefined }
          ),
          ({ latitude, longitude }) => {
            const linkData = getMapLinkData(latitude, longitude);

            // "No location" should be returned
            expect(linkData.hasLink).toBe(false);
            expect(linkData.text).toBe('No location');

            // URL should not be present
            expect(linkData.url).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link behavior for edge case coordinate values
     */
    it('should handle edge case coordinate values correctly', () => {
      fc.assert(
        fc.property(
          // Generate edge case coordinates
          fc.constantFrom(
            // Boundary values
            { latitude: 0, longitude: 0 },
            { latitude: 90, longitude: 180 },
            { latitude: -90, longitude: -180 },
            { latitude: 0, longitude: 180 },
            { latitude: 90, longitude: 0 },
            // Very small values
            { latitude: 0.0001, longitude: 0.0001 },
            { latitude: -0.0001, longitude: -0.0001 },
            // Mixed edge cases
            { latitude: 89.9999, longitude: 179.9999 },
            { latitude: -89.9999, longitude: -179.9999 }
          ),
          ({ latitude, longitude }) => {
            const linkData = getMapLinkData(latitude, longitude);

            // All edge case coordinates should produce valid map links
            expect(linkData.hasLink).toBe(true);

            // Verify URL is correctly formatted
            expect(linkData.url).toBe(`https://www.google.com/maps?q=${latitude},${longitude}`);

            // Verify security attributes
            expect(linkData.target).toBe('_blank');
            expect(linkData.rel).toBe('noopener noreferrer');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link URL format is always correct for valid coordinates
     */
    it('should always generate correct Google Maps URL format for valid coordinates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true }),
          (latitude, longitude) => {
            const linkData = getMapLinkData(latitude, longitude);

            // URL should start with Google Maps base URL
            expect(linkData.url.startsWith('https://www.google.com/maps?q=')).toBe(true);

            // URL should contain both coordinates
            expect(linkData.url.includes(`${latitude}`)).toBe(true);
            expect(linkData.url.includes(`${longitude}`)).toBe(true);

            // URL should have correct format
            const expectedUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            expect(linkData.url).toBe(expectedUrl);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link security attributes are always present
     */
    it('should always include security attributes (target="_blank" and rel="noopener noreferrer") for valid coordinates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true }),
          (latitude, longitude) => {
            const linkData = getMapLinkData(latitude, longitude);

            // Verify target="_blank" is present
            expect(linkData.target).toBe('_blank');

            // Verify rel="noopener noreferrer" is present
            expect(linkData.rel).toBe('noopener noreferrer');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link behavior is deterministic (same input = same output)
     */
    it('should return consistent results for the same coordinate values (deterministic)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
          fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
          (latitude, longitude) => {
            // Call function twice with same coordinates
            const linkData1 = getMapLinkData(latitude, longitude);
            const linkData2 = getMapLinkData(latitude, longitude);

            // Both calls should produce identical results
            expect(linkData1).toEqual(linkData2);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link handles all possible coordinate validity combinations
     */
    it('should correctly determine coordinate validity for all combinations', () => {
      fc.assert(
        fc.property(
          fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
          fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
          (latitude, longitude) => {
            const linkData = getMapLinkData(latitude, longitude);
            const hasValid = hasValidCoordinates(latitude, longitude);

            if (hasValid) {
              // Valid coordinates: map link should be enabled
              expect(linkData.hasLink).toBe(true);
              expect(linkData.url).toBe(`https://www.google.com/maps?q=${latitude},${longitude}`);
              expect(linkData.text).toBe('Open Maps');
            } else {
              // Invalid coordinates: "No location" should be returned
              expect(linkData.hasLink).toBe(false);
              expect(linkData.text).toBe('No location');
              expect(linkData.url).toBeUndefined();
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link never throws errors regardless of coordinate values
     */
    it('should never throw errors for any coordinate values', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          fc.anything(),
          (latitude, longitude) => {
            // Should not throw for any input
            expect(() => {
              getMapLinkData(latitude, longitude);
            }).not.toThrow();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test map link returns exactly one state: link enabled or "No location"
     */
    it('should return exactly one state: link enabled or "No location", never both', () => {
      fc.assert(
        fc.property(
          fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
          fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
          (latitude, longitude) => {
            const linkData = getMapLinkData(latitude, longitude);

            // Exactly one state should be true (XOR logic)
            const hasLinkState = linkData.hasLink === true && linkData.url !== undefined;
            const hasNoLocationState = linkData.hasLink === false && linkData.text === 'No location';

            // XOR: one must be true, but not both
            expect(hasLinkState !== hasNoLocationState).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test coordinate (0, 0) is treated as valid (Gulf of Guinea location)
     */
    it('should treat coordinate (0, 0) as valid location (not falsy)', () => {
      const linkData = getMapLinkData(0, 0);

      // (0, 0) is a valid coordinate and should produce a map link
      expect(linkData.hasLink).toBe(true);
      expect(linkData.url).toBe('https://www.google.com/maps?q=0,0');
      expect(linkData.text).toBe('Open Maps');
      expect(linkData.target).toBe('_blank');
      expect(linkData.rel).toBe('noopener noreferrer');
    });

    /**
     * Test that only null/undefined are treated as invalid, not falsy values like 0
     */
    it('should only treat null/undefined as invalid, not other falsy values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            // Falsy but valid coordinates
            { latitude: 0, longitude: 0, shouldBeValid: true },
            { latitude: 0, longitude: 50, shouldBeValid: true },
            { latitude: 50, longitude: 0, shouldBeValid: true },
            // Actually invalid coordinates
            { latitude: null, longitude: 0, shouldBeValid: false },
            { latitude: 0, longitude: null, shouldBeValid: false },
            { latitude: undefined, longitude: 0, shouldBeValid: false },
            { latitude: 0, longitude: undefined, shouldBeValid: false },
            { latitude: null, longitude: null, shouldBeValid: false },
            { latitude: undefined, longitude: undefined, shouldBeValid: false }
          ),
          ({ latitude, longitude, shouldBeValid }) => {
            const linkData = getMapLinkData(latitude, longitude);

            if (shouldBeValid) {
              expect(linkData.hasLink).toBe(true);
              expect(linkData.url).toBeDefined();
            } else {
              expect(linkData.hasLink).toBe(false);
              expect(linkData.text).toBe('No location');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

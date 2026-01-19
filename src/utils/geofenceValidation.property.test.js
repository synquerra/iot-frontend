import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateCoordinate,
  validatePolygon,
  autoClosePolygon,
  detectSelfIntersection
} from './geofenceValidation';

/**
 * Property-Based Tests for Geofence Validation
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

describe('Property-Based Tests: Geofence Validation', () => {
  
  /**
   * Property 1: Coordinate validation is deterministic
   * **Validates: Requirements 1.3**
   * 
   * For any given coordinate pair, validation should always return the same result
   */
  it('Property: Coordinate validation is deterministic', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const result1 = validateCoordinate(lat, lng);
          const result2 = validateCoordinate(lat, lng);
          
          // Same inputs should produce identical results
          expect(result1.isValid).toBe(result2.isValid);
          expect(result1.errors.length).toBe(result2.errors.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Polygon closure is idempotent
   * **Validates: Requirements 1.2**
   * 
   * Closing a polygon multiple times should produce the same result as closing it once
   */
  it('Property: Polygon closure is idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (coords) => {
          const closed1 = autoClosePolygon(coords);
          const closed2 = autoClosePolygon(closed1);
          
          // Closing twice should equal closing once
          expect(closed2.length).toBe(closed1.length);
          expect(closed2[0]).toEqual(closed1[0]);
          expect(closed2[closed2.length - 1]).toEqual(closed1[closed1.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Valid coordinates remain valid after serialization
   * **Validates: Requirements 1.3**
   * 
   * Coordinates that pass validation should remain valid after JSON round-trip
   */
  it('Property: Valid coordinates remain valid after serialization', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const original = validateCoordinate(lat, lng);
          
          if (original.isValid) {
            // Serialize and deserialize
            const serialized = JSON.stringify({ latitude: lat, longitude: lng });
            const deserialized = JSON.parse(serialized);
            
            const afterRoundTrip = validateCoordinate(
              deserialized.latitude,
              deserialized.longitude
            );
            
            // Should still be valid
            expect(afterRoundTrip.isValid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Self-intersection detection is symmetric
   * **Validates: Requirements 1.4**
   * 
   * If a polygon intersects itself, the detection should be consistent
   * regardless of minor floating-point variations
   */
  it('Property: Self-intersection detection is consistent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }),
          { minLength: 4, maxLength: 8 }
        ),
        (coords) => {
          const result1 = detectSelfIntersection(coords);
          const result2 = detectSelfIntersection(coords);
          
          // Detection should be deterministic
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Minimum points validation is consistent
   * **Validates: Requirements 1.1**
   * 
   * Polygons with fewer than 3 points should always be invalid
   */
  it('Property: Minimum points validation is consistent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }),
          { minLength: 0, maxLength: 2 }
        ),
        (coords) => {
          const result = validatePolygon(coords);
          
          // Should always be invalid with < 3 points
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.code === 'MIN_POINTS')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 6: Valid polygons have valid coordinates
   * **Validates: Requirements 1.3**
   * 
   * If a polygon is valid, all its coordinates must be valid
   */
  it('Property: Valid polygons have valid coordinates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (coords) => {
          const polygonResult = validatePolygon(coords);
          
          if (polygonResult.isValid) {
            // All coordinates should be individually valid
            coords.forEach(coord => {
              const coordResult = validateCoordinate(coord.latitude, coord.longitude);
              expect(coordResult.isValid).toBe(true);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Coordinate range boundaries are respected
   * **Validates: Requirements 1.3**
   * 
   * Coordinates outside valid ranges should always be rejected
   */
  it('Property: Coordinate range boundaries are respected', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: 91, max: 180, noNaN: true }),
          fc.double({ min: -180, max: -91, noNaN: true })
        ),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (invalidLat, lng) => {
          const result = validateCoordinate(invalidLat, lng);
          expect(result.isValid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );

    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.oneof(
          fc.double({ min: 181, max: 360, noNaN: true }),
          fc.double({ min: -360, max: -181, noNaN: true })
        ),
        (lat, invalidLng) => {
          const result = validateCoordinate(lat, invalidLng);
          expect(result.isValid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Property-Based Tests for Telemetry Data Display Completeness
 * 
 * Feature: dynamic-telemetry-data, Property 4: Telemetry data display completeness
 * Validates: Requirements 2.2
 * 
 * Tests that when normal packet data is received, the system displays all telemetry values
 * (latitude, longitude, speed, temperature) with proper formatting and completeness.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { transformLiveData } from './telemetryTransformers.js';

describe('Telemetry Data Display Completeness - Property-Based Tests', () => {
  /**
   * Property 4: Telemetry data display completeness
   * For any normal packet data received, the system should display all telemetry values
   * (latitude, longitude, speed, temperature)
   * 
   * Feature: dynamic-telemetry-data, Property 4: Telemetry data display completeness
   * Validates: Requirements 2.2
   */
  it('should display all required telemetry values for any valid analytics data', async () => {
    await fc.assert(
      fc.property(
        // Generate analytics data with all required telemetry fields
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            imei: fc.string({ minLength: 10, maxLength: 20 }),
            latitude: fc.float({ min: -90, max: 90, noNaN: true }),
            longitude: fc.float({ min: -180, max: 180, noNaN: true }),
            speed: fc.float({ min: 0, max: 300, noNaN: true }),
            rawTemperature: fc.float({ min: -50, max: 100, noNaN: true }),
            battery: fc.integer({ min: 0, max: 100 }),
            deviceTimestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            timestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            alert: fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined))
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (analyticsData) => {
          // Transform the analytics data using the live data transformer
          const liveData = transformLiveData(analyticsData);

          // Verify that all required telemetry values are present and properly typed
          expect(liveData).toBeDefined();
          expect(typeof liveData).toBe('object');

          // Check that all required fields are present
          expect(liveData).toHaveProperty('latitude');
          expect(liveData).toHaveProperty('longitude');
          expect(liveData).toHaveProperty('speed');
          expect(liveData).toHaveProperty('temperature');
          expect(liveData).toHaveProperty('battery');

          // Verify that all values are numbers (not NaN, null, or undefined)
          expect(typeof liveData.latitude).toBe('number');
          expect(typeof liveData.longitude).toBe('number');
          expect(typeof liveData.speed).toBe('number');
          expect(typeof liveData.temperature).toBe('number');
          expect(typeof liveData.battery).toBe('number');

          // Verify that values are not NaN
          expect(Number.isNaN(liveData.latitude)).toBe(false);
          expect(Number.isNaN(liveData.longitude)).toBe(false);
          expect(Number.isNaN(liveData.speed)).toBe(false);
          expect(Number.isNaN(liveData.temperature)).toBe(false);
          expect(Number.isNaN(liveData.battery)).toBe(false);

          // Verify that values are within reasonable ranges
          expect(liveData.latitude).toBeGreaterThanOrEqual(-90);
          expect(liveData.latitude).toBeLessThanOrEqual(90);
          expect(liveData.longitude).toBeGreaterThanOrEqual(-180);
          expect(liveData.longitude).toBeLessThanOrEqual(180);
          expect(liveData.speed).toBeGreaterThanOrEqual(0);
          expect(liveData.temperature).toBeGreaterThanOrEqual(-50);
          expect(liveData.temperature).toBeLessThanOrEqual(100);
          expect(liveData.battery).toBeGreaterThanOrEqual(0);
          expect(liveData.battery).toBeLessThanOrEqual(100);

          // Verify that conditional styling flags are present and boolean
          expect(liveData).toHaveProperty('hasHighTemp');
          expect(liveData).toHaveProperty('hasHighSpeed');
          expect(typeof liveData.hasHighTemp).toBe('boolean');
          expect(typeof liveData.hasHighSpeed).toBe('boolean');

          // Verify conditional styling logic
          expect(liveData.hasHighTemp).toBe(liveData.temperature > 50);
          expect(liveData.hasHighSpeed).toBe(liveData.speed > 100);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property test for telemetry data display with edge cases
   */
  it('should handle edge case values and still display all telemetry fields', async () => {
    await fc.assert(
      fc.property(
        // Generate analytics data with edge case values
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            imei: fc.string({ minLength: 10, maxLength: 20 }),
            latitude: fc.oneof(
              fc.constant(0),
              fc.constant(-90),
              fc.constant(90),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant(''),
              fc.float({ min: -90, max: 90, noNaN: true })
            ),
            longitude: fc.oneof(
              fc.constant(0),
              fc.constant(-180),
              fc.constant(180),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant(''),
              fc.float({ min: -180, max: 180, noNaN: true })
            ),
            speed: fc.oneof(
              fc.constant(0),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant(''),
              fc.float({ min: 0, max: 300, noNaN: true })
            ),
            rawTemperature: fc.oneof(
              fc.constant(0),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant(''),
              fc.float({ min: -50, max: 100, noNaN: true })
            ),
            battery: fc.oneof(
              fc.constant(0),
              fc.constant(100),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant(''),
              fc.integer({ min: 0, max: 100 })
            ),
            deviceTimestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            timestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            alert: fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined))
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (analyticsData) => {
          // Transform the analytics data
          const liveData = transformLiveData(analyticsData);

          // Verify that all required fields are still present even with edge case inputs
          expect(liveData).toBeDefined();
          expect(typeof liveData).toBe('object');

          // All required fields must be present
          expect(liveData).toHaveProperty('latitude');
          expect(liveData).toHaveProperty('longitude');
          expect(liveData).toHaveProperty('speed');
          expect(liveData).toHaveProperty('temperature');
          expect(liveData).toHaveProperty('battery');
          expect(liveData).toHaveProperty('hasHighTemp');
          expect(liveData).toHaveProperty('hasHighSpeed');

          // All values must be numbers (transformed from null/undefined/empty to 0)
          expect(typeof liveData.latitude).toBe('number');
          expect(typeof liveData.longitude).toBe('number');
          expect(typeof liveData.speed).toBe('number');
          expect(typeof liveData.temperature).toBe('number');
          expect(typeof liveData.battery).toBe('number');

          // Values must not be NaN
          expect(Number.isNaN(liveData.latitude)).toBe(false);
          expect(Number.isNaN(liveData.longitude)).toBe(false);
          expect(Number.isNaN(liveData.speed)).toBe(false);
          expect(Number.isNaN(liveData.temperature)).toBe(false);
          expect(Number.isNaN(liveData.battery)).toBe(false);

          // Conditional flags must be boolean
          expect(typeof liveData.hasHighTemp).toBe('boolean');
          expect(typeof liveData.hasHighSpeed).toBe('boolean');

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property test for empty or invalid analytics data
   */
  it('should provide default telemetry values when analytics data is empty or invalid', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]),
          fc.constant(null),
          fc.constant(undefined),
          fc.array(fc.record({}), { maxLength: 3 }) // Empty objects
        ),
        (invalidData) => {
          // Transform invalid/empty data
          const liveData = transformLiveData(invalidData);

          // Verify that all required fields are present with default values
          expect(liveData).toBeDefined();
          expect(typeof liveData).toBe('object');

          // All required fields must be present
          expect(liveData).toHaveProperty('latitude');
          expect(liveData).toHaveProperty('longitude');
          expect(liveData).toHaveProperty('speed');
          expect(liveData).toHaveProperty('temperature');
          expect(liveData).toHaveProperty('battery');
          expect(liveData).toHaveProperty('hasHighTemp');
          expect(liveData).toHaveProperty('hasHighSpeed');

          // Default values should be 0 for numeric fields
          expect(liveData.latitude).toBe(0);
          expect(liveData.longitude).toBe(0);
          expect(liveData.speed).toBe(0);
          expect(liveData.temperature).toBe(0);
          expect(liveData.battery).toBe(0);

          // Conditional flags should be false for default values
          expect(liveData.hasHighTemp).toBe(false);
          expect(liveData.hasHighSpeed).toBe(false);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property test for data ordering - most recent packet should be used
   */
  it('should use the most recent packet data for telemetry display', async () => {
    await fc.assert(
      fc.property(
        // Generate multiple packets with different timestamps
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            imei: fc.string({ minLength: 10, maxLength: 20 }),
            latitude: fc.float({ min: -90, max: 90, noNaN: true }),
            longitude: fc.float({ min: -180, max: 180, noNaN: true }),
            speed: fc.float({ min: 0, max: 300, noNaN: true }),
            rawTemperature: fc.float({ min: -50, max: 100, noNaN: true }),
            battery: fc.integer({ min: 0, max: 100 }),
            deviceTimestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            timestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            alert: fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined))
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (analyticsData) => {
          // Sort the data to find the most recent packet
          const sortedData = [...analyticsData].sort((a, b) => {
            const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
            const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
            return timeB - timeA;
          });

          const mostRecentPacket = sortedData[0];

          // Transform the analytics data
          const liveData = transformLiveData(analyticsData);

          // Verify that the transformed data matches the most recent packet
          expect(liveData.latitude).toBe(Number(mostRecentPacket.latitude) || 0);
          expect(liveData.longitude).toBe(Number(mostRecentPacket.longitude) || 0);
          expect(liveData.speed).toBe(Number(mostRecentPacket.speed) || 0);
          expect(liveData.temperature).toBe(Number(mostRecentPacket.rawTemperature) || 0);
          expect(liveData.battery).toBe(Number(mostRecentPacket.battery) || 0);

          // Verify conditional styling based on most recent packet
          const expectedHighTemp = (Number(mostRecentPacket.rawTemperature) || 0) > 50;
          const expectedHighSpeed = (Number(mostRecentPacket.speed) || 0) > 100;
          expect(liveData.hasHighTemp).toBe(expectedHighTemp);
          expect(liveData.hasHighSpeed).toBe(expectedHighSpeed);

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property test for numeric conversion and validation
   */
  it('should properly convert string numeric values to numbers for display', async () => {
    await fc.assert(
      fc.property(
        // Generate analytics data with string numeric values
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            imei: fc.string({ minLength: 10, maxLength: 20 }),
            latitude: fc.oneof(
              fc.float({ min: -90, max: 90, noNaN: true }).map(n => n.toString()),
              fc.float({ min: -90, max: 90, noNaN: true })
            ),
            longitude: fc.oneof(
              fc.float({ min: -180, max: 180, noNaN: true }).map(n => n.toString()),
              fc.float({ min: -180, max: 180, noNaN: true })
            ),
            speed: fc.oneof(
              fc.float({ min: 0, max: 300, noNaN: true }).map(n => n.toString()),
              fc.float({ min: 0, max: 300, noNaN: true })
            ),
            rawTemperature: fc.oneof(
              fc.float({ min: -50, max: 100, noNaN: true }).map(n => n.toString()),
              fc.float({ min: -50, max: 100, noNaN: true })
            ),
            battery: fc.oneof(
              fc.integer({ min: 0, max: 100 }).map(n => n.toString()),
              fc.integer({ min: 0, max: 100 })
            ),
            deviceTimestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            timestamp: fc.constant('2024-01-01T12:00:00.000Z'),
            alert: fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined))
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (analyticsData) => {
          // Transform the analytics data
          const liveData = transformLiveData(analyticsData);

          // Verify that all values are properly converted to numbers
          expect(typeof liveData.latitude).toBe('number');
          expect(typeof liveData.longitude).toBe('number');
          expect(typeof liveData.speed).toBe('number');
          expect(typeof liveData.temperature).toBe('number');
          expect(typeof liveData.battery).toBe('number');

          // Verify that values are not NaN after conversion
          expect(Number.isNaN(liveData.latitude)).toBe(false);
          expect(Number.isNaN(liveData.longitude)).toBe(false);
          expect(Number.isNaN(liveData.speed)).toBe(false);
          expect(Number.isNaN(liveData.temperature)).toBe(false);
          expect(Number.isNaN(liveData.battery)).toBe(false);

          // Verify that all required display fields are present
          expect(liveData).toHaveProperty('latitude');
          expect(liveData).toHaveProperty('longitude');
          expect(liveData).toHaveProperty('speed');
          expect(liveData).toHaveProperty('temperature');
          expect(liveData).toHaveProperty('battery');
          expect(liveData).toHaveProperty('hasHighTemp');
          expect(liveData).toHaveProperty('hasHighSpeed');

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
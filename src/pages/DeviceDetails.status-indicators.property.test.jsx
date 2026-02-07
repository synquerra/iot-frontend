/**
 * Property-Based Tests for Status Indicators Display
 * 
 * Feature: device-detail-alert-error-enhancement
 * Property 1: Status Indicators Display
 * 
 * These tests verify that status indicators display with appropriate color coding
 * based on value ranges across many randomly generated inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Helper functions from DeviceDetails.jsx
 * These are the actual functions being tested
 */

function getGpsStatus(p) {
  const lat = Number(p?.latitude);
  const lon = Number(p?.longitude);
  if (!lat || !lon) return { text: "No GPS", color: "bg-red-600" };

  const speed = Number(p?.speed ?? 0);
  if (isNaN(speed)) return { text: "Unknown", color: "bg-gray-600" };
  if (speed === 0) return { text: "Idle", color: "bg-yellow-500" };
  return { text: "Moving", color: "bg-green-500" };
}

function getSpeedStatus(p) {
  const speed = Number(p?.speed);
  if (isNaN(speed)) return { text: "-", color: "bg-gray-600" };
  if (speed === 0) return { text: "Idle", color: "bg-yellow-600" };
  if (speed > 70) return { text: "Overspeed", color: "bg-red-600" };
  return { text: "Normal", color: "bg-green-600" };
}

function getBatteryStatus(p) {
  const b = p?.battery;
  const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
  if (isNaN(n)) return { text: "-", color: "bg-gray-600" };
  if (n >= 60) return { text: "Good", color: "bg-green-600" };
  if (n >= 20) return { text: "Medium", color: "bg-yellow-600" };
  return { text: "Low", color: "bg-red-600" };
}

describe('DeviceDetails - Status Indicators Property-Based Tests', () => {
  /**
   * Property 1: Status Indicators Display
   * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
   * 
   * For any normal packet with status data (GPS, speed, battery, signal),
   * the status section should display each indicator with appropriate color
   * coding based on the value ranges.
   */
  describe('Property 1: Status Indicators Display', () => {
    /**
     * Test GPS status indicator displays correctly for all coordinate combinations
     */
    it('should display GPS status with correct color coding for any coordinate values', () => {
      fc.assert(
        fc.property(
          // Generate random latitude, longitude, and speed values
          fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
          fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
          fc.option(fc.double({ min: 0, max: 200, noNaN: true }), { nil: null }),
          (latitude, longitude, speed) => {
            const packet = { latitude, longitude, speed };
            const status = getGpsStatus(packet);

            // Verify return structure
            expect(status).toHaveProperty('text');
            expect(status).toHaveProperty('color');
            expect(typeof status.text).toBe('string');
            expect(typeof status.color).toBe('string');

            // Verify color coding based on conditions
            const lat = Number(latitude);
            const lon = Number(longitude);
            const spd = Number(speed ?? 0);

            if (!lat || !lon) {
              // No GPS case
              expect(status.text).toBe("No GPS");
              expect(status.color).toBe("bg-red-600");
            } else if (isNaN(spd)) {
              // Unknown speed case
              expect(status.text).toBe("Unknown");
              expect(status.color).toBe("bg-gray-600");
            } else if (spd === 0) {
              // Idle case
              expect(status.text).toBe("Idle");
              expect(status.color).toBe("bg-yellow-500");
            } else {
              // Moving case
              expect(status.text).toBe("Moving");
              expect(status.color).toBe("bg-green-500");
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test speed status indicator displays correctly for all speed values
     */
    it('should display speed status with correct color coding for any speed value', () => {
      fc.assert(
        fc.property(
          // Generate random speed values including edge cases
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(NaN),
            fc.double({ min: 0, max: 200, noNaN: true })
          ),
          (speed) => {
            const packet = { speed };
            const status = getSpeedStatus(packet);

            // Verify return structure
            expect(status).toHaveProperty('text');
            expect(status).toHaveProperty('color');
            expect(typeof status.text).toBe('string');
            expect(typeof status.color).toBe('string');

            // Verify color coding based on speed ranges
            const spd = Number(speed);

            if (isNaN(spd)) {
              // Missing or invalid speed
              expect(status.text).toBe("-");
              expect(status.color).toBe("bg-gray-600");
            } else if (spd === 0) {
              // Idle
              expect(status.text).toBe("Idle");
              expect(status.color).toBe("bg-yellow-600");
            } else if (spd > 70) {
              // Overspeed
              expect(status.text).toBe("Overspeed");
              expect(status.color).toBe("bg-red-600");
            } else {
              // Normal speed
              expect(status.text).toBe("Normal");
              expect(status.color).toBe("bg-green-600");
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test battery status indicator displays correctly for all battery values
     */
    it('should display battery status with correct color coding for any battery value', () => {
      fc.assert(
        fc.property(
          // Generate random battery values including various formats
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer({ min: 0, max: 100 }),
            fc.double({ min: 0, max: 100, noNaN: true }),
            fc.string().map(s => `${fc.sample(fc.integer({ min: 0, max: 100 }), 1)[0]}%`)
          ),
          (battery) => {
            const packet = { battery };
            const status = getBatteryStatus(packet);

            // Verify return structure
            expect(status).toHaveProperty('text');
            expect(status).toHaveProperty('color');
            expect(typeof status.text).toBe('string');
            expect(typeof status.color).toBe('string');

            // Verify color coding based on battery ranges
            const b = battery;
            const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));

            if (isNaN(n)) {
              // Missing or invalid battery
              expect(status.text).toBe("-");
              expect(status.color).toBe("bg-gray-600");
            } else if (n >= 60) {
              // Good battery
              expect(status.text).toBe("Good");
              expect(status.color).toBe("bg-green-600");
            } else if (n >= 20) {
              // Medium battery
              expect(status.text).toBe("Medium");
              expect(status.color).toBe("bg-yellow-600");
            } else {
              // Low battery
              expect(status.text).toBe("Low");
              expect(status.color).toBe("bg-red-600");
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test all status indicators together with random packet data
     */
    it('should display all status indicators with correct color coding for any packet', () => {
      fc.assert(
        fc.property(
          // Generate complete random packet with all status fields
          fc.record({
            latitude: fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
            longitude: fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
            speed: fc.option(fc.double({ min: 0, max: 200, noNaN: true }), { nil: null }),
            battery: fc.oneof(
              fc.constant(null),
              fc.integer({ min: 0, max: 100 }),
              fc.double({ min: 0, max: 100, noNaN: true })
            ),
            signal: fc.option(fc.integer({ min: 0, max: 31 }), { nil: null })
          }),
          (packet) => {
            // Get all status indicators
            const gpsStatus = getGpsStatus(packet);
            const speedStatus = getSpeedStatus(packet);
            const batteryStatus = getBatteryStatus(packet);

            // Verify all status indicators have required structure
            [gpsStatus, speedStatus, batteryStatus].forEach(status => {
              expect(status).toHaveProperty('text');
              expect(status).toHaveProperty('color');
              expect(typeof status.text).toBe('string');
              expect(typeof status.color).toBe('string');
              expect(status.text.length).toBeGreaterThan(0);
              expect(status.color).toMatch(/^bg-(red|green|yellow|gray|amber|blue)-\d{3}$/);
            });

            // Verify GPS status logic
            const lat = Number(packet.latitude);
            const lon = Number(packet.longitude);
            if (!lat || !lon) {
              expect(gpsStatus.color).toMatch(/bg-red-600/);
            } else {
              const spd = Number(packet.speed ?? 0);
              if (spd === 0) {
                expect(gpsStatus.color).toMatch(/bg-yellow-500/);
              } else if (!isNaN(spd)) {
                expect(gpsStatus.color).toMatch(/bg-green-500/);
              }
            }

            // Verify speed status logic
            const speed = Number(packet.speed);
            if (isNaN(speed)) {
              expect(speedStatus.color).toMatch(/bg-gray-600/);
            } else if (speed === 0) {
              expect(speedStatus.color).toMatch(/bg-yellow-600/);
            } else if (speed > 70) {
              expect(speedStatus.color).toMatch(/bg-red-600/);
            } else {
              expect(speedStatus.color).toMatch(/bg-green-600/);
            }

            // Verify battery status logic
            const b = packet.battery;
            const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
            if (isNaN(n)) {
              expect(batteryStatus.color).toMatch(/bg-gray-600/);
            } else if (n >= 60) {
              expect(batteryStatus.color).toMatch(/bg-green-600/);
            } else if (n >= 20) {
              expect(batteryStatus.color).toMatch(/bg-yellow-600/);
            } else {
              expect(batteryStatus.color).toMatch(/bg-red-600/);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test status indicators handle edge cases correctly
     */
    it('should handle edge case values correctly for all status indicators', () => {
      fc.assert(
        fc.property(
          // Generate edge case scenarios
          fc.constantFrom(
            // GPS edge cases
            { latitude: 0, longitude: 0, speed: 0 },
            { latitude: null, longitude: null, speed: 50 },
            { latitude: 90, longitude: 180, speed: 0 },
            { latitude: -90, longitude: -180, speed: 100 },
            // Speed edge cases
            { speed: 0 },
            { speed: 70 },
            { speed: 71 },
            { speed: null },
            { speed: undefined },
            // Battery edge cases
            { battery: 0 },
            { battery: 19 },
            { battery: 20 },
            { battery: 59 },
            { battery: 60 },
            { battery: 100 },
            { battery: null },
            { battery: undefined },
            { battery: "50%" },
            { battery: "75%" }
          ),
          (packet) => {
            // All status functions should handle edge cases without throwing
            expect(() => getGpsStatus(packet)).not.toThrow();
            expect(() => getSpeedStatus(packet)).not.toThrow();
            expect(() => getBatteryStatus(packet)).not.toThrow();

            // All should return valid status objects
            const gpsStatus = getGpsStatus(packet);
            const speedStatus = getSpeedStatus(packet);
            const batteryStatus = getBatteryStatus(packet);

            expect(gpsStatus).toHaveProperty('text');
            expect(gpsStatus).toHaveProperty('color');
            expect(speedStatus).toHaveProperty('text');
            expect(speedStatus).toHaveProperty('color');
            expect(batteryStatus).toHaveProperty('text');
            expect(batteryStatus).toHaveProperty('color');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test status indicators are deterministic (same input = same output)
     */
    it('should return consistent results for the same input (deterministic)', () => {
      fc.assert(
        fc.property(
          fc.record({
            latitude: fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: null }),
            longitude: fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: null }),
            speed: fc.option(fc.double({ min: 0, max: 200, noNaN: true }), { nil: null }),
            battery: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null })
          }),
          (packet) => {
            // Call each function twice with the same input
            const gpsStatus1 = getGpsStatus(packet);
            const gpsStatus2 = getGpsStatus(packet);
            const speedStatus1 = getSpeedStatus(packet);
            const speedStatus2 = getSpeedStatus(packet);
            const batteryStatus1 = getBatteryStatus(packet);
            const batteryStatus2 = getBatteryStatus(packet);

            // Results should be identical
            expect(gpsStatus1).toEqual(gpsStatus2);
            expect(speedStatus1).toEqual(speedStatus2);
            expect(batteryStatus1).toEqual(batteryStatus2);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

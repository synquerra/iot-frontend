/**
 * Property-Based Tests for Packet Data Formatting
 * 
 * Feature: dynamic-telemetry-data, Property 7: Packet data formatting
 * Validates: Requirements 3.2
 * 
 * Tests that when packet data is displayed, the system shows all values with proper formatting.
 * This includes normal packet data with latitude, longitude, speed, temperature, and battery values,
 * as well as error packet data with error codes and timestamps.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { transformPacketData, formatTimestamp } from '../utils/telemetryTransformers.js';

describe('Packet Data Formatting - Property-Based Tests', () => {
  /**
   * Property 7: Packet data formatting
   * For any packet data displayed, the system should show all values with proper formatting
   * 
   * Feature: dynamic-telemetry-data, Property 7: Packet data formatting
   * Validates: Requirements 3.2
   */
  it('should format normal packet data with all required fields and proper types', async () => {
    await fc.assert(
      fc.property(
        // Generate analytics data with all required packet fields
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
          // Transform the analytics data using the packet data transformer
          const packetData = transformPacketData(analyticsData);

          // Verify that packet data structure is properly formatted
          expect(packetData).toBeDefined();
          expect(typeof packetData).toBe('object');

          // Verify normal packet structure and formatting
          expect(packetData).toHaveProperty('normalPacket');
          expect(typeof packetData.normalPacket).toBe('object');

          const normalPacket = packetData.normalPacket;

          // Check that all required normal packet fields are present and properly formatted
          expect(normalPacket).toHaveProperty('lat');
          expect(normalPacket).toHaveProperty('lng');
          expect(normalPacket).toHaveProperty('speed');
          expect(normalPacket).toHaveProperty('temp');
          expect(normalPacket).toHaveProperty('battery');

          // Verify that all normal packet values are numbers (proper formatting)
          expect(typeof normalPacket.lat).toBe('number');
          expect(typeof normalPacket.lng).toBe('number');
          expect(typeof normalPacket.speed).toBe('number');
          expect(typeof normalPacket.temp).toBe('number');
          expect(typeof normalPacket.battery).toBe('number');

          // Verify that values are not NaN (proper formatting)
          expect(Number.isNaN(normalPacket.lat)).toBe(false);
          expect(Number.isNaN(normalPacket.lng)).toBe(false);
          expect(Number.isNaN(normalPacket.speed)).toBe(false);
          expect(Number.isNaN(normalPacket.temp)).toBe(false);
          expect(Number.isNaN(normalPacket.battery)).toBe(false);

          // Verify that values are within reasonable ranges (proper formatting)
          expect(normalPacket.lat).toBeGreaterThanOrEqual(-90);
          expect(normalPacket.lat).toBeLessThanOrEqual(90);
          expect(normalPacket.lng).toBeGreaterThanOrEqual(-180);
          expect(normalPacket.lng).toBeLessThanOrEqual(180);
          expect(normalPacket.speed).toBeGreaterThanOrEqual(0);
          expect(normalPacket.temp).toBeGreaterThanOrEqual(-50);
          expect(normalPacket.temp).toBeLessThanOrEqual(100);
          expect(normalPacket.battery).toBeGreaterThanOrEqual(0);
          expect(normalPacket.battery).toBeLessThanOrEqual(100);

          // Verify error packet structure (should be null for normal packets)
          expect(packetData).toHaveProperty('errorPacket');
          expect(packetData.errorPacket).toBeNull();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property test for error packet formatting
   */
  it('should format error packet data with proper error code and timestamp formatting', async () => {
    await fc.assert(
      fc.property(
        // Generate analytics data with error packets (non-empty, non-whitespace alert field)
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
            // Generate non-whitespace alert strings that will pass the trim() !== '' filter
            alert: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== '' && s.trim() !== 'null' && s.trim() !== 'undefined')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (analyticsData) => {
          // Ensure at least one packet has a valid (non-whitespace) alert
          const hasValidAlert = analyticsData.some(packet => 
            packet.alert && 
            packet.alert.trim() !== '' && 
            packet.alert.trim() !== 'null' &&
            packet.alert.trim() !== 'undefined'
          );

          // Skip this test case if no valid alerts are present
          if (!hasValidAlert) {
            return true;
          }

          // Transform the analytics data
          const packetData = transformPacketData(analyticsData);

          // Verify that packet data structure is properly formatted
          expect(packetData).toBeDefined();
          expect(typeof packetData).toBe('object');

          // Verify normal packet is still present and formatted
          expect(packetData).toHaveProperty('normalPacket');
          expect(typeof packetData.normalPacket).toBe('object');

          // Verify error packet structure and formatting
          expect(packetData).toHaveProperty('errorPacket');
          expect(packetData.errorPacket).not.toBeNull();
          expect(typeof packetData.errorPacket).toBe('object');

          const errorPacket = packetData.errorPacket;

          // Check that error packet has required fields with proper formatting
          expect(errorPacket).toHaveProperty('code');
          expect(errorPacket).toHaveProperty('timestamp');

          // Verify error code formatting (should be a non-empty string)
          expect(typeof errorPacket.code).toBe('string');
          expect(errorPacket.code.length).toBeGreaterThan(0);
          expect(errorPacket.code.trim()).not.toBe('');

          // Verify timestamp formatting (should be in DD-MM-YYYY HH:MM:SS format)
          expect(typeof errorPacket.timestamp).toBe('string');
          expect(errorPacket.timestamp).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
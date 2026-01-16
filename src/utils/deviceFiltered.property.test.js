/**
 * Property-Based Tests for Device Filtered API Wrapper
 * 
 * Feature: user-based-device-filtering
 * Property 7: Filter Application Consistency
 * Validates: Requirements 4.5
 * 
 * Tests that filtering logic is applied consistently regardless of which
 * API wrapper function is called or which page/component initiates the request.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { listDevicesFiltered, getDeviceByTopicFiltered, getDeviceFilterConfig } from './deviceFiltered.js';
import * as deviceAPI from './device.js';
import * as authParser from './authResponseParser.js';

// Mock the device API and auth parser
vi.mock('./device.js', () => ({
  listDevices: vi.fn(),
  getDeviceByTopic: vi.fn(),
}));

vi.mock('./authResponseParser.js', () => ({
  loadUserContext: vi.fn(),
}));

describe('Device Filtered API Wrapper - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
  });

  /**
   * Property 7: Filter Application Consistency
   * 
   * For any API call that fetches device data, if the user is a PARENTS user,
   * the filtering logic should be applied consistently regardless of which
   * page or component initiated the request.
   * 
   * Feature: user-based-device-filtering, Property 7: Filter Application Consistency
   * Validates: Requirements 4.5
   */
  it('should apply consistent filtering for PARENTS users across multiple API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid IMEIs for PARENTS user
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 1, maxLength: 5 }
        ),
        // Generate device list with mix of matching and non-matching IMEIs
        fc.array(
          fc.record({
            topic: fc.string({ minLength: 5, maxLength: 20 }),
            imei: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join(''))
          }),
          { minLength: 5, maxLength: 20 }
        ),
        async (assignedIMEIs, allDevices) => {
          // Setup: Mock PARENTS user context
          const userContext = {
            userType: 'PARENTS',
            imeis: assignedIMEIs,
            uniqueId: 'test-user-123',
            email: 'test@example.com',
            tokens: {
              accessToken: 'test-token',
              refreshToken: 'test-refresh-token'
            }
          };

          authParser.loadUserContext.mockReturnValue(userContext);

          // Mock API to return all devices
          deviceAPI.listDevices.mockResolvedValue({
            devices: allDevices,
            full: allDevices,
            total: allDevices.length
          });

          // Call 1: List devices (simulating Devices page)
          const result1 = await listDevicesFiltered(1, 20);

          // Call 2: List devices again (simulating Dashboard page)
          const result2 = await listDevicesFiltered(1, 20);

          // Call 3: List devices with different pagination (simulating Analytics page)
          const result3 = await listDevicesFiltered(2, 10);

          // Property: All calls should apply the same filtering logic
          // The filtered device lists should contain the same devices (ignoring pagination)
          const filteredDevices1 = result1.full;
          const filteredDevices2 = result2.full;
          const filteredDevices3 = result3.full;

          // All three calls should produce identical filtered lists
          expect(filteredDevices1.length).toBe(filteredDevices2.length);
          expect(filteredDevices2.length).toBe(filteredDevices3.length);

          // Verify all filtered devices match at least one assigned IMEI
          const normalizedAssignedIMEIs = assignedIMEIs.map(imei => 
            String(imei).toLowerCase()
          );

          filteredDevices1.forEach(device => {
            const deviceIMEI = String(device.imei).toLowerCase();
            expect(normalizedAssignedIMEIs).toContain(deviceIMEI);
          });

          filteredDevices2.forEach(device => {
            const deviceIMEI = String(device.imei).toLowerCase();
            expect(normalizedAssignedIMEIs).toContain(deviceIMEI);
          });

          filteredDevices3.forEach(device => {
            const deviceIMEI = String(device.imei).toLowerCase();
            expect(normalizedAssignedIMEIs).toContain(deviceIMEI);
          });

          // Verify the same devices appear in all filtered lists
          const topics1 = filteredDevices1.map(d => d.topic).sort();
          const topics2 = filteredDevices2.map(d => d.topic).sort();
          const topics3 = filteredDevices3.map(d => d.topic).sort();

          expect(topics1).toEqual(topics2);
          expect(topics2).toEqual(topics3);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Consistent filtering for single device access
   * 
   * Tests that getDeviceByTopicFiltered applies the same authorization logic
   * consistently across multiple calls.
   */
  it('should apply consistent authorization for PARENTS users when accessing single devices', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid IMEIs for PARENTS user
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 1, maxLength: 3 }
        ),
        // Generate a device
        fc.record({
          topic: fc.string({ minLength: 5, maxLength: 20 }),
          imei: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join(''))
        }),
        async (assignedIMEIs, device) => {
          // Setup: Mock PARENTS user context
          const userContext = {
            userType: 'PARENTS',
            imeis: assignedIMEIs,
            uniqueId: 'test-user-123',
            email: 'test@example.com',
            tokens: {
              accessToken: 'test-token',
              refreshToken: 'test-refresh-token'
            }
          };

          authParser.loadUserContext.mockReturnValue(userContext);

          // Mock API to return the device
          deviceAPI.getDeviceByTopic.mockResolvedValue(device);

          // Call 1: Get device (simulating Telemetry page)
          const result1 = await getDeviceByTopicFiltered(device.topic);

          // Call 2: Get device again (simulating Device Details page)
          const result2 = await getDeviceByTopicFiltered(device.topic);

          // Call 3: Get device again (simulating Dashboard widget)
          const result3 = await getDeviceByTopicFiltered(device.topic);

          // Property: All calls should apply the same authorization logic
          // Determine if device should be authorized
          const deviceIMEI = String(device.imei).toLowerCase();
          const normalizedAssignedIMEIs = assignedIMEIs.map(imei => 
            String(imei).toLowerCase()
          );
          const shouldBeAuthorized = normalizedAssignedIMEIs.includes(deviceIMEI);

          // All three calls should produce the same result
          if (shouldBeAuthorized) {
            expect(result1).toEqual(device);
            expect(result2).toEqual(device);
            expect(result3).toEqual(device);
          } else {
            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(result3).toBeNull();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Consistent filtering for ADMIN users
   * 
   * Tests that ADMIN users always see all devices consistently across all API calls.
   */
  it('should consistently return all devices for ADMIN users across multiple API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate any IMEI list (should be ignored for ADMIN)
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 0, maxLength: 5 }
        ),
        // Generate device list
        fc.array(
          fc.record({
            topic: fc.string({ minLength: 5, maxLength: 20 }),
            imei: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join(''))
          }),
          { minLength: 5, maxLength: 15 }
        ),
        async (assignedIMEIs, allDevices) => {
          // Setup: Mock ADMIN user context
          const userContext = {
            userType: 'ADMIN',
            imeis: assignedIMEIs,
            uniqueId: 'admin-user-123',
            email: 'admin@example.com',
            tokens: {
              accessToken: 'admin-token',
              refreshToken: 'admin-refresh-token'
            }
          };

          authParser.loadUserContext.mockReturnValue(userContext);

          // Mock API to return all devices
          deviceAPI.listDevices.mockResolvedValue({
            devices: allDevices,
            full: allDevices,
            total: allDevices.length
          });

          // Call 1: List devices (simulating Devices page)
          const result1 = await listDevicesFiltered(1, 20);

          // Call 2: List devices again (simulating Dashboard page)
          const result2 = await listDevicesFiltered(1, 20);

          // Call 3: List devices with different pagination (simulating Analytics page)
          const result3 = await listDevicesFiltered(2, 10);

          // Property: All calls should return all devices without filtering
          expect(result1.full.length).toBe(allDevices.length);
          expect(result2.full.length).toBe(allDevices.length);
          expect(result3.full.length).toBe(allDevices.length);

          // Verify all devices are present in all results
          const allTopics = allDevices.map(d => d.topic).sort();
          const topics1 = result1.full.map(d => d.topic).sort();
          const topics2 = result2.full.map(d => d.topic).sort();
          const topics3 = result3.full.map(d => d.topic).sort();

          expect(topics1).toEqual(allTopics);
          expect(topics2).toEqual(allTopics);
          expect(topics3).toEqual(allTopics);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Consistent authorization for ADMIN accessing single devices
   * 
   * Tests that ADMIN users can always access any device consistently.
   */
  it('should consistently authorize all devices for ADMIN users when accessing single devices', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate any IMEI list (should be ignored for ADMIN)
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 0, maxLength: 3 }
        ),
        // Generate a device
        fc.record({
          topic: fc.string({ minLength: 5, maxLength: 20 }),
          imei: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join(''))
        }),
        async (assignedIMEIs, device) => {
          // Setup: Mock ADMIN user context
          const userContext = {
            userType: 'ADMIN',
            imeis: assignedIMEIs,
            uniqueId: 'admin-user-123',
            email: 'admin@example.com',
            tokens: {
              accessToken: 'admin-token',
              refreshToken: 'admin-refresh-token'
            }
          };

          authParser.loadUserContext.mockReturnValue(userContext);

          // Mock API to return the device
          deviceAPI.getDeviceByTopic.mockResolvedValue(device);

          // Call 1: Get device (simulating Telemetry page)
          const result1 = await getDeviceByTopicFiltered(device.topic);

          // Call 2: Get device again (simulating Device Details page)
          const result2 = await getDeviceByTopicFiltered(device.topic);

          // Call 3: Get device again (simulating Dashboard widget)
          const result3 = await getDeviceByTopicFiltered(device.topic);

          // Property: All calls should return the device (ADMIN can access all devices)
          expect(result1).toEqual(device);
          expect(result2).toEqual(device);
          expect(result3).toEqual(device);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Filter config consistency
   * 
   * Tests that getDeviceFilterConfig returns consistent configuration
   * across multiple calls with the same user context.
   */
  it('should return consistent filter configuration across multiple calls', () => {
    fc.assert(
      fc.property(
        // Generate user type
        fc.constantFrom('PARENTS', 'ADMIN'),
        // Generate IMEIs
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 0, maxLength: 5 }
        ),
        (userType, imeis) => {
          // Setup: Mock user context
          const userContext = {
            userType: userType,
            imeis: imeis,
            uniqueId: 'test-user-123',
            email: 'test@example.com',
            tokens: {
              accessToken: 'test-token',
              refreshToken: 'test-refresh-token'
            }
          };

          authParser.loadUserContext.mockReturnValue(userContext);

          // Call getDeviceFilterConfig multiple times
          const config1 = getDeviceFilterConfig();
          const config2 = getDeviceFilterConfig();
          const config3 = getDeviceFilterConfig();

          // Property: All calls should return identical configuration
          expect(config1.userType).toBe(config2.userType);
          expect(config2.userType).toBe(config3.userType);
          expect(config1.userType).toBe(userType);

          expect(config1.allowedIMEIs).toEqual(config2.allowedIMEIs);
          expect(config2.allowedIMEIs).toEqual(config3.allowedIMEIs);
          expect(config1.allowedIMEIs).toEqual(imeis);

          expect(config1.isFiltering).toBe(config2.isFiltering);
          expect(config2.isFiltering).toBe(config3.isFiltering);
          expect(config1.isFiltering).toBe(userType === 'PARENTS');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Consistent behavior with no user context
   * 
   * Tests that all API wrapper functions behave consistently when there's
   * no user context (unauthenticated state).
   */
  it('should consistently return empty/null results when no user context exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate device list
        fc.array(
          fc.record({
            topic: fc.string({ minLength: 5, maxLength: 20 }),
            imei: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join(''))
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (allDevices) => {
          // Setup: Mock no user context
          authParser.loadUserContext.mockReturnValue(null);

          // Mock API to return devices
          deviceAPI.listDevices.mockResolvedValue({
            devices: allDevices,
            full: allDevices,
            total: allDevices.length
          });

          if (allDevices.length > 0) {
            deviceAPI.getDeviceByTopic.mockResolvedValue(allDevices[0]);
          }

          // Call 1: List devices
          const listResult1 = await listDevicesFiltered(1, 20);

          // Call 2: List devices again
          const listResult2 = await listDevicesFiltered(1, 20);

          // Property: Both calls should return empty filtered lists
          expect(listResult1.full).toEqual([]);
          expect(listResult2.full).toEqual([]);
          expect(listResult1.filteredCount).toBe(0);
          expect(listResult2.filteredCount).toBe(0);

          if (allDevices.length > 0) {
            // Call 3: Get single device
            const deviceResult1 = await getDeviceByTopicFiltered(allDevices[0].topic);

            // Call 4: Get single device again
            const deviceResult2 = await getDeviceByTopicFiltered(allDevices[0].topic);

            // Property: Both calls should return null (not authorized)
            expect(deviceResult1).toBeNull();
            expect(deviceResult2).toBeNull();
          }

          // Call 5: Get filter config
          const config1 = getDeviceFilterConfig();
          const config2 = getDeviceFilterConfig();

          // Property: Config calls should return consistent null user type
          expect(config1.userType).toBeNull();
          expect(config2.userType).toBeNull();
          expect(config1.allowedIMEIs).toEqual([]);
          expect(config2.allowedIMEIs).toEqual([]);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

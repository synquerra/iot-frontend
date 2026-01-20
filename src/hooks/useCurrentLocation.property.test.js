/**
 * Property-Based Tests for useCurrentLocation Hook
 * 
 * Feature: geofence-current-location
 * Tests correctness properties for the current location feature
 * 
 * Property 1: Location Fetch Idempotency
 * Property 2: Error State Recovery
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { useCurrentLocation } from './useCurrentLocation';

describe('useCurrentLocation - Property-Based Tests', () => {
  let mockGeolocation;

  beforeEach(() => {
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 1: Location Fetch Idempotency
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2**
   * 
   * Formal Specification:
   * ∀ clicks ∈ ButtonClicks:
   *   getCurrentLocation() → (Success(location) ∨ Error(message))
   *   ∧ Success(location) → MapCentered(location)
   *   ∧ Error(message) → ErrorDisplayed(message)
   * 
   * Description: Clicking the current location button multiple times should always 
   * result in the same behavior - fetching the current location and centering the map.
   * Each call should independently succeed or fail with appropriate state updates.
   */
  it('Property 1: Location fetch idempotency - multiple calls should behave consistently', () => {
    fc.assert(
      fc.property(
        // Generate random location coordinates
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        // Generate number of consecutive calls (2-5)
        fc.integer({ min: 2, max: 5 }),
        async (coords, numCalls) => {
          // Mock successful geolocation response
          mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
              coords: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            });
          });

          const { result } = renderHook(() => useCurrentLocation());

          // Make multiple consecutive calls
          const results = [];
          for (let i = 0; i < numCalls; i++) {
            let locationResult;
            await act(async () => {
              locationResult = await result.current.getCurrentLocation();
            });
            
            results.push({
              location: result.current.location,
              loading: result.current.loading,
              error: result.current.error,
              returnValue: locationResult,
            });
          }

          // Verify idempotency: all calls should produce consistent results
          results.forEach((callResult, index) => {
            // Each call should succeed with the same location
            expect(callResult.location).toEqual({
              lat: coords.latitude,
              lng: coords.longitude,
            });
            
            // Loading should be false after completion
            expect(callResult.loading).toBe(false);
            
            // No error should be present
            expect(callResult.error).toBeNull();
            
            // Return value should match the location
            expect(callResult.returnValue).toEqual({
              lat: coords.latitude,
              lng: coords.longitude,
            });
          });

          // All results should be identical
          for (let i = 1; i < results.length; i++) {
            expect(results[i].location).toEqual(results[0].location);
            expect(results[i].error).toEqual(results[0].error);
            expect(results[i].loading).toEqual(results[0].loading);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 1 (continued): Idempotency with errors
   * 
   * Tests that error responses are also consistent across multiple calls
   */
  it('Property 1: Error responses should be consistent across multiple calls', () => {
    fc.assert(
      fc.property(
        // Generate error codes (1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT)
        fc.constantFrom(1, 2, 3),
        // Generate number of consecutive calls (2-4)
        fc.integer({ min: 2, max: 4 }),
        async (errorCode, numCalls) => {
          // Mock error response
          mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          const { result } = renderHook(() => useCurrentLocation());

          // Make multiple consecutive calls
          const results = [];
          for (let i = 0; i < numCalls; i++) {
            await act(async () => {
              try {
                await result.current.getCurrentLocation();
              } catch (e) {
                // Expected to throw
              }
            });
            
            results.push({
              location: result.current.location,
              loading: result.current.loading,
              error: result.current.error,
            });
          }

          // Verify idempotency: all calls should produce consistent error results
          results.forEach((callResult) => {
            // Location should be null after error
            expect(callResult.location).toBeNull();
            
            // Loading should be false after completion
            expect(callResult.loading).toBe(false);
            
            // Error should be present
            expect(callResult.error).not.toBeNull();
            expect(typeof callResult.error).toBe('string');
          });

          // All error messages should be identical
          for (let i = 1; i < results.length; i++) {
            expect(results[i].error).toEqual(results[0].error);
            expect(results[i].location).toEqual(results[0].location);
            expect(results[i].loading).toEqual(results[0].loading);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 1 (continued): Mixed success and error scenarios
   * 
   * Tests that the hook handles alternating success and error responses correctly
   */
  it('Property 1: Should handle alternating success and error responses consistently', () => {
    fc.assert(
      fc.property(
        // Generate location coordinates
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        // Generate error code
        fc.constantFrom(1, 2, 3),
        async (coords, errorCode) => {
          const { result } = renderHook(() => useCurrentLocation());

          // First call: success
          mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
              coords: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            });
          });

          let firstResult;
          await act(async () => {
            firstResult = await result.current.getCurrentLocation();
          });

          const firstState = {
            location: result.current.location,
            loading: result.current.loading,
            error: result.current.error,
          };

          // Verify first call succeeded
          expect(firstState.location).toEqual({
            lat: coords.latitude,
            lng: coords.longitude,
          });
          expect(firstState.error).toBeNull();
          expect(firstState.loading).toBe(false);

          // Second call: error
          mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          await act(async () => {
            try {
              await result.current.getCurrentLocation();
            } catch (e) {
              // Expected to throw
            }
          });

          const secondState = {
            location: result.current.location,
            loading: result.current.loading,
            error: result.current.error,
          };

          // Verify second call failed appropriately
          expect(secondState.location).toBeNull();
          expect(secondState.error).not.toBeNull();
          expect(secondState.loading).toBe(false);

          // Third call: success again
          mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
              coords: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            });
          });

          await act(async () => {
            await result.current.getCurrentLocation();
          });

          const thirdState = {
            location: result.current.location,
            loading: result.current.loading,
            error: result.current.error,
          };

          // Verify third call succeeded and cleared error
          expect(thirdState.location).toEqual({
            lat: coords.latitude,
            lng: coords.longitude,
          });
          expect(thirdState.error).toBeNull();
          expect(thirdState.loading).toBe(false);

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 2: Error State Recovery
   * 
   * **Validates: Requirements 2.2, 2.4, 3.1, 3.2, 3.3, 3.4**
   * 
   * Formal Specification:
   * ∀ error ∈ GeolocationErrors:
   *   Error(error) → loading = false ∧ ButtonEnabled = true
   * 
   * Description: After any error state, the component should return to a usable state 
   * where the user can retry. The button should be enabled and loading should be false.
   */
  it('Property 2: Error state recovery - hook should return to usable state after any error', () => {
    fc.assert(
      fc.property(
        // Generate all possible error codes
        fc.constantFrom(1, 2, 3, 999), // PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT, UNKNOWN
        async (errorCode) => {
          // Mock error response
          mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          const { result } = renderHook(() => useCurrentLocation());

          // Trigger error
          await act(async () => {
            try {
              await result.current.getCurrentLocation();
            } catch (e) {
              // Expected to throw
            }
          });

          // Verify error state recovery
          expect(result.current.loading).toBe(false); // Loading should be false
          expect(result.current.error).not.toBeNull(); // Error should be present
          expect(result.current.location).toBeNull(); // Location should be null
          expect(typeof result.current.getCurrentLocation).toBe('function'); // Function should still be available

          // Verify that the hook is in a usable state (can be called again)
          // Mock a successful response for retry
          mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060,
              },
            });
          });

          // Retry should work
          await act(async () => {
            await result.current.getCurrentLocation();
          });

          // Verify recovery after retry
          expect(result.current.loading).toBe(false);
          expect(result.current.error).toBeNull(); // Error should be cleared
          expect(result.current.location).toEqual({
            lat: 40.7128,
            lng: -74.0060,
          });

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2 (continued): Button should remain enabled after error
   * 
   * Tests that after any error, the button state allows for retry
   */
  it('Property 2: After error, button should be enabled for retry', () => {
    fc.assert(
      fc.property(
        // Generate error codes
        fc.constantFrom(1, 2, 3),
        async (errorCode) => {
          mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          const { result } = renderHook(() => useCurrentLocation());

          // Trigger error
          await act(async () => {
            try {
              await result.current.getCurrentLocation();
            } catch (e) {
              // Expected
            }
          });

          // After error, loading must be false (button would be enabled)
          expect(result.current.loading).toBe(false);
          
          // Error message should be present
          expect(result.current.error).toBeTruthy();
          expect(typeof result.current.error).toBe('string');
          
          // Function should still be callable
          expect(typeof result.current.getCurrentLocation).toBe('function');

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2 (continued): Error messages should be user-friendly
   * 
   * Tests that all error types produce appropriate user-friendly messages
   */
  it('Property 2: All error types should produce user-friendly error messages', () => {
    fc.assert(
      fc.property(
        // Generate error codes
        fc.constantFrom(1, 2, 3, 999),
        async (errorCode) => {
          mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          const { result } = renderHook(() => useCurrentLocation());

          await act(async () => {
            try {
              await result.current.getCurrentLocation();
            } catch (e) {
              // Expected
            }
          });

          // Error message should be a non-empty string
          expect(result.current.error).toBeTruthy();
          expect(typeof result.current.error).toBe('string');
          expect(result.current.error.length).toBeGreaterThan(0);

          // Error message should be user-friendly (not technical)
          const errorMsg = result.current.error.toLowerCase();
          
          // Should not contain technical jargon
          expect(errorMsg).not.toContain('undefined');
          expect(errorMsg).not.toContain('null');
          expect(errorMsg).not.toContain('exception');
          
          // Should contain helpful guidance
          const hasGuidance = 
            errorMsg.includes('please') ||
            errorMsg.includes('try again') ||
            errorMsg.includes('enable') ||
            errorMsg.includes('unable') ||
            errorMsg.includes('denied') ||
            errorMsg.includes('not supported');
          
          expect(hasGuidance).toBe(true);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2 (continued): Browser not supported error
   * 
   * Tests that missing geolocation API is handled gracefully
   */
  it('Property 2: Missing geolocation API should be handled gracefully', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // Simulate missing API
        async () => {
          // Remove geolocation from navigator
          const originalGeolocation = global.navigator.geolocation;
          delete global.navigator.geolocation;

          const { result } = renderHook(() => useCurrentLocation());

          await act(async () => {
            try {
              await result.current.getCurrentLocation();
            } catch (e) {
              // Expected
            }
          });

          // Verify error state
          expect(result.current.loading).toBe(false);
          expect(result.current.error).toBe('Geolocation is not supported by your browser.');
          expect(result.current.location).toBeNull();

          // Restore geolocation
          global.navigator.geolocation = originalGeolocation;

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

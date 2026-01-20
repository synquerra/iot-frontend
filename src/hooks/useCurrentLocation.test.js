import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrentLocation } from './useCurrentLocation';

/**
 * Unit tests for useCurrentLocation hook
 * Tests geolocation API integration, error handling, and state management
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4
 */

describe('useCurrentLocation', () => {
  let mockGeolocation;

  beforeEach(() => {
    // Create a mock geolocation object
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // Replace navigator.geolocation with our mock
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null location, false loading, and null error', () => {
      const { result } = renderHook(() => useCurrentLocation());

      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.getCurrentLocation).toBe('function');
    });
  });

  describe('Successful Location Fetch', () => {
    it('should fetch location successfully and update state', async () => {
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useCurrentLocation());

      let locationPromise;
      act(() => {
        locationPromise = result.current.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.location).toEqual({
        lat: 37.7749,
        lng: -122.4194,
      });
      expect(result.current.error).toBeNull();

      const coords = await locationPromise;
      expect(coords).toEqual({
        lat: 37.7749,
        lng: -122.4194,
      });
    });

    it('should set loading to true during fetch', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // Don't call success or error immediately
      });

      const { result } = renderHook(() => useCurrentLocation());

      act(() => {
        result.current.getCurrentLocation();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should clear previous error on successful fetch', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      // First call fails
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      const { result } = renderHook(() => useCurrentLocation());

      // First attempt - should fail
      await act(async () => {
        try {
          await result.current.getCurrentLocation();
        } catch (e) {
          // Expected to fail
        }
      });

      expect(result.current.error).not.toBeNull();

      // Second call succeeds
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      // Second attempt - should succeed
      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.location).toEqual({
        lat: 40.7128,
        lng: -74.0060,
      });
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling - PERMISSION_DENIED', () => {
    it('should handle PERMISSION_DENIED error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
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
          expect(e.message).toBe('Location access denied. Please enable location in your browser settings.');
        }
      });

      expect(result.current.error).toBe('Location access denied. Please enable location in your browser settings.');
      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling - POSITION_UNAVAILABLE', () => {
    it('should handle POSITION_UNAVAILABLE error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
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
          expect(e.message).toBe('Unable to determine your location. Please try again.');
        }
      });

      expect(result.current.error).toBe('Unable to determine your location. Please try again.');
      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling - TIMEOUT', () => {
    it('should handle TIMEOUT error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 3, // TIMEOUT
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
          expect(e.message).toBe('Location request timed out. Please try again.');
        }
      });

      expect(result.current.error).toBe('Location request timed out. Please try again.');
      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling - Unknown Error', () => {
    it('should handle unknown error codes', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 999, // Unknown error code
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
          expect(e.message).toBe('An unknown error occurred while fetching your location.');
        }
      });

      expect(result.current.error).toBe('An unknown error occurred while fetching your location.');
      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Browser Support', () => {
    it('should handle missing geolocation API', async () => {
      // Remove geolocation from navigator
      delete global.navigator.geolocation;

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        try {
          await result.current.getCurrentLocation();
        } catch (e) {
          expect(e.message).toBe('Geolocation is not supported by your browser.');
        }
      });

      expect(result.current.error).toBe('Geolocation is not supported by your browser.');
      expect(result.current.location).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Geolocation API Options', () => {
    it('should call getCurrentPosition with correct options', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple consecutive calls correctly', async () => {
      const mockPosition1 = {
        coords: { latitude: 37.7749, longitude: -122.4194 },
      };
      const mockPosition2 = {
        coords: { latitude: 40.7128, longitude: -74.0060 },
      };

      mockGeolocation.getCurrentPosition
        .mockImplementationOnce((success) => success(mockPosition1))
        .mockImplementationOnce((success) => success(mockPosition2));

      const { result } = renderHook(() => useCurrentLocation());

      // First call
      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.location).toEqual({
        lat: 37.7749,
        lng: -122.4194,
      });

      // Second call
      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.location).toEqual({
        lat: 40.7128,
        lng: -74.0060,
      });
    });
  });

  describe('Promise Resolution', () => {
    it('should resolve promise with coordinates on success', async () => {
      const mockPosition = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useCurrentLocation());

      const coords = await act(async () => {
        return await result.current.getCurrentLocation();
      });

      expect(coords).toEqual({
        lat: 48.8566,
        lng: 2.3522,
      });
    });

    it('should reject promise with error on failure', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { result } = renderHook(() => useCurrentLocation());

      await act(async () => {
        await expect(result.current.getCurrentLocation()).rejects.toThrow(
          'Location access denied. Please enable location in your browser settings.'
        );
      });
    });
  });
});

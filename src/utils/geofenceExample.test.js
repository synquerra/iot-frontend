/**
 * Tests for Geofence Example Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setGeofenceExample, setRectangularGeofence, setCircularGeofence, setGeofenceFromForm } from './geofenceExample.js';
import * as deviceCommandAPI from './deviceCommandAPI.js';

describe('Geofence Example Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setGeofenceExample', () => {
    it('should send SET_GEOFENCE command with example coordinates', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      await setGeofenceExample();

      expect(sendCommandSpy).toHaveBeenCalledWith(
        '862942074957887',
        'SET_GEOFENCE',
        expect.objectContaining({
          geofence_number: 'GEO1',
          geofence_id: 'Home',
          coordinates: expect.arrayContaining([
            expect.objectContaining({ latitude: expect.any(Number), longitude: expect.any(Number) })
          ])
        })
      );
    });

    it('should return the API response', async () => {
      const mockResponse = { success: true, message: 'Geofence set' };
      vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue(mockResponse);

      const result = await setGeofenceExample();

      expect(result).toEqual(mockResponse);
    });

    it('should throw error if API call fails', async () => {
      const error = new Error('API Error');
      vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockRejectedValue(error);

      await expect(setGeofenceExample()).rejects.toThrow('API Error');
    });
  });

  describe('setRectangularGeofence', () => {
    it('should create rectangular geofence with 5 coordinates', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      const topLeft = { lat: 23.302, lng: 85.327 };
      const bottomRight = { lat: 23.301, lng: 85.328 };

      await setRectangularGeofence('123456789012345', 'Office', topLeft, bottomRight);

      const callArgs = sendCommandSpy.mock.calls[0];
      expect(callArgs[2].coordinates).toHaveLength(5);
      expect(callArgs[2].coordinates[0]).toEqual(callArgs[2].coordinates[4]); // Closed polygon
    });

    it('should use correct corner coordinates', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      const topLeft = { lat: 23.302, lng: 85.327 };
      const bottomRight = { lat: 23.301, lng: 85.328 };

      await setRectangularGeofence('123456789012345', 'Office', topLeft, bottomRight);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      expect(coords[0]).toEqual({ latitude: 23.302, longitude: 85.327 }); // Top-left
      expect(coords[1]).toEqual({ latitude: 23.302, longitude: 85.328 }); // Top-right
      expect(coords[2]).toEqual({ latitude: 23.301, longitude: 85.328 }); // Bottom-right
      expect(coords[3]).toEqual({ latitude: 23.301, longitude: 85.327 }); // Bottom-left
    });
  });

  describe('setCircularGeofence', () => {
    it('should create circular geofence with default 16 points', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      await setCircularGeofence('123456789012345', 'Home', 23.301624, 85.327065, 100);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      expect(coords).toHaveLength(17); // 16 points + 1 closing point
    });

    it('should create circular geofence with custom number of points', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      await setCircularGeofence('123456789012345', 'Home', 23.301624, 85.327065, 100, 8);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      expect(coords).toHaveLength(9); // 8 points + 1 closing point
    });

    it('should form a closed polygon', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      await setCircularGeofence('123456789012345', 'Home', 23.301624, 85.327065, 100);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      const first = coords[0];
      const last = coords[coords.length - 1];
      
      expect(first.latitude).toBeCloseTo(last.latitude, 6);
      expect(first.longitude).toBeCloseTo(last.longitude, 6);
    });

    it('should use correct geofence parameters', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      await setCircularGeofence('123456789012345', 'Park', 23.301624, 85.327065, 100);

      expect(sendCommandSpy).toHaveBeenCalledWith(
        '123456789012345',
        'SET_GEOFENCE',
        expect.objectContaining({
          geofence_number: 'GEO1',
          geofence_id: 'Park'
        })
      );
    });
  });

  describe('setGeofenceFromForm', () => {
    it('should process form data and send command', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      const formData = {
        imei: '123456789012345',
        geofenceName: 'School',
        coordinates: [
          { latitude: 23.301, longitude: 85.327 },
          { latitude: 23.302, longitude: 85.328 },
          { latitude: 23.303, longitude: 85.329 },
          { latitude: 23.301, longitude: 85.327 }
        ]
      };

      await setGeofenceFromForm(formData);

      expect(sendCommandSpy).toHaveBeenCalledWith(
        '123456789012345',
        'SET_GEOFENCE',
        expect.objectContaining({
          geofence_number: 'GEO1',
          geofence_id: 'School',
          coordinates: formData.coordinates
        })
      );
    });

    it('should auto-close polygon if not already closed', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      const formData = {
        imei: '123456789012345',
        geofenceName: 'School',
        coordinates: [
          { latitude: 23.301, longitude: 85.327 },
          { latitude: 23.302, longitude: 85.328 },
          { latitude: 23.303, longitude: 85.329 }
        ]
      };

      await setGeofenceFromForm(formData);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      expect(coords).toHaveLength(4); // Original 3 + closing point
      expect(coords[0]).toEqual(coords[3]); // First equals last
    });

    it('should not duplicate closing point if already closed', async () => {
      const sendCommandSpy = vi.spyOn(deviceCommandAPI, 'sendDeviceCommand').mockResolvedValue({ success: true });

      const formData = {
        imei: '123456789012345',
        geofenceName: 'School',
        coordinates: [
          { latitude: 23.301, longitude: 85.327 },
          { latitude: 23.302, longitude: 85.328 },
          { latitude: 23.303, longitude: 85.329 },
          { latitude: 23.301, longitude: 85.327 }
        ]
      };

      await setGeofenceFromForm(formData);

      const coords = sendCommandSpy.mock.calls[0][2].coordinates;
      expect(coords).toHaveLength(4); // Should not add extra closing point
    });
  });
});

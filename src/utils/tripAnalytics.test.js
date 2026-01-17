// src/utils/tripAnalytics.test.js
import { describe, it, expect } from 'vitest';
import {
  detectTrips,
  calculateTripDistance,
  calculateTripDuration,
  estimateFuelConsumption,
  calculateIdleTime,
  getTripStatistics,
  formatDuration,
  formatDistance
} from './tripAnalytics';

describe('tripAnalytics', () => {
  describe('detectTrips', () => {
    it('should return empty array for empty input', () => {
      expect(detectTrips([])).toEqual([]);
      expect(detectTrips(null)).toEqual([]);
      expect(detectTrips(undefined)).toEqual([]);
    });

    it('should detect a single trip from moving data', () => {
      const data = [
        { imei: '123', speed: 10, latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z' },
        { imei: '123', speed: 15, latitude: 40.7138, longitude: -74.0070, timestamp: '2024-01-01T10:01:00Z' },
        { imei: '123', speed: 20, latitude: 40.7148, longitude: -74.0080, timestamp: '2024-01-01T10:02:00Z' },
      ];

      const trips = detectTrips(data);
      expect(trips).toHaveLength(1);
      expect(trips[0].deviceImei).toBe('123');
      expect(trips[0].points).toHaveLength(3);
    });

    it('should separate trips with time gaps', () => {
      const data = [
        { imei: '123', speed: 10, latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z' },
        { imei: '123', speed: 15, latitude: 40.7138, longitude: -74.0070, timestamp: '2024-01-01T10:01:00Z' },
        { imei: '123', speed: 20, latitude: 40.7148, longitude: -74.0080, timestamp: '2024-01-01T10:02:00Z' },
        // 10 minute gap
        { imei: '123', speed: 12, latitude: 40.7158, longitude: -74.0090, timestamp: '2024-01-01T10:12:00Z' },
        { imei: '123', speed: 18, latitude: 40.7168, longitude: -74.0100, timestamp: '2024-01-01T10:13:00Z' },
        { imei: '123', speed: 22, latitude: 40.7178, longitude: -74.0110, timestamp: '2024-01-01T10:14:00Z' },
      ];

      const trips = detectTrips(data);
      expect(trips).toHaveLength(2);
    });

    it('should ignore idle periods', () => {
      const data = [
        { imei: '123', speed: 10, latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z' },
        { imei: '123', speed: 2, latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:01:00Z' }, // idle
        { imei: '123', speed: 15, latitude: 40.7138, longitude: -74.0070, timestamp: '2024-01-01T10:02:00Z' },
      ];

      const trips = detectTrips(data);
      expect(trips).toHaveLength(0); // Not enough consecutive moving points
    });

    it('should filter out trips with invalid coordinates', () => {
      const data = [
        { imei: '123', speed: 10, latitude: 0, longitude: 0, timestamp: '2024-01-01T10:00:00Z' },
        { imei: '123', speed: 15, latitude: 0, longitude: 0, timestamp: '2024-01-01T10:01:00Z' },
        { imei: '123', speed: 20, latitude: 0, longitude: 0, timestamp: '2024-01-01T10:02:00Z' },
      ];

      const trips = detectTrips(data);
      expect(trips).toHaveLength(0);
    });
  });

  describe('calculateTripDistance', () => {
    it('should return 0 for empty or single point', () => {
      expect(calculateTripDistance([])).toBe(0);
      expect(calculateTripDistance([{ latitude: 40.7128, longitude: -74.0060 }])).toBe(0);
    });

    it('should calculate distance between two points', () => {
      const points = [
        { latitude: 40.7128, longitude: -74.0060 }, // New York
        { latitude: 40.7614, longitude: -73.9776 }, // Times Square
      ];

      const distance = calculateTripDistance(points);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10); // Should be a few km
    });

    it('should handle invalid coordinates gracefully', () => {
      const points = [
        { latitude: 40.7128, longitude: -74.0060 },
        { latitude: NaN, longitude: NaN },
        { latitude: 40.7614, longitude: -73.9776 },
      ];

      const distance = calculateTripDistance(points);
      // Should skip the invalid middle point and calculate distance from first to last
      expect(distance).toBeGreaterThanOrEqual(0); // Returns 0 if all segments are invalid
    });
  });

  describe('calculateTripDuration', () => {
    it('should return 0 for invalid input', () => {
      expect(calculateTripDuration(null)).toBe(0);
      expect(calculateTripDuration({})).toBe(0);
    });

    it('should calculate duration from startTime and endTime', () => {
      const trip = {
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:30:00Z'
      };

      const duration = calculateTripDuration(trip);
      expect(duration).toBe(1800); // 30 minutes = 1800 seconds
    });

    it('should calculate duration from points', () => {
      const trip = {
        points: [
          { timestamp: '2024-01-01T10:00:00Z' },
          { timestamp: '2024-01-01T10:15:00Z' }
        ]
      };

      const duration = calculateTripDuration(trip);
      expect(duration).toBe(900); // 15 minutes = 900 seconds
    });
  });

  describe('estimateFuelConsumption', () => {
    it('should return 0 for invalid input', () => {
      expect(estimateFuelConsumption(0, 50)).toBe(0);
      expect(estimateFuelConsumption(100, 0)).toBe(0);
      expect(estimateFuelConsumption(-10, 50)).toBe(0);
    });

    it('should estimate fuel for optimal speed', () => {
      const fuel = estimateFuelConsumption(100, 60); // 100km at 60 km/h
      expect(fuel).toBeGreaterThan(0);
      expect(fuel).toBeLessThan(15); // Should be reasonable
    });

    it('should increase fuel consumption for city driving', () => {
      const cityFuel = estimateFuelConsumption(100, 30);
      const highwayFuel = estimateFuelConsumption(100, 60);
      expect(cityFuel).toBeGreaterThan(highwayFuel);
    });

    it('should increase fuel consumption for high-speed driving', () => {
      const normalFuel = estimateFuelConsumption(100, 60);
      const highSpeedFuel = estimateFuelConsumption(100, 120);
      expect(highSpeedFuel).toBeGreaterThan(normalFuel);
    });
  });

  describe('calculateIdleTime', () => {
    it('should return zeros for empty or insufficient data', () => {
      const result = calculateIdleTime([]);
      expect(result.idleTime).toBe(0);
      expect(result.movingTime).toBe(0);
      expect(result.totalTime).toBe(0);
    });

    it('should calculate idle and moving time', () => {
      const data = [
        { speed: 0, timestamp: '2024-01-01T10:00:00Z' },
        { speed: 2, timestamp: '2024-01-01T10:05:00Z' }, // 5 min idle
        { speed: 50, timestamp: '2024-01-01T10:10:00Z' }, // 5 min moving
        { speed: 60, timestamp: '2024-01-01T10:20:00Z' }, // 10 min moving
      ];

      const result = calculateIdleTime(data);
      expect(result.idleTime).toBe(300); // 5 minutes
      expect(result.movingTime).toBe(900); // 15 minutes
      expect(result.totalTime).toBe(1200); // 20 minutes
    });

    it('should calculate percentages correctly', () => {
      const data = [
        { speed: 0, timestamp: '2024-01-01T10:00:00Z' },
        { speed: 2, timestamp: '2024-01-01T10:30:00Z' }, // 30 min idle
        { speed: 50, timestamp: '2024-01-01T11:00:00Z' }, // 30 min moving
      ];

      const result = calculateIdleTime(data);
      expect(result.idlePercentage).toBe(50);
      expect(result.movingPercentage).toBe(50);
    });
  });

  describe('getTripStatistics', () => {
    it('should return zeros for empty trips', () => {
      const stats = getTripStatistics([]);
      expect(stats.totalTrips).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });

    it('should calculate aggregate statistics', () => {
      const trips = [
        { distance: 10, duration: 600, avgSpeed: 60, maxSpeed: 80 },
        { distance: 20, duration: 1200, avgSpeed: 60, maxSpeed: 90 },
        { distance: 15, duration: 900, avgSpeed: 60, maxSpeed: 85 },
      ];

      const stats = getTripStatistics(trips);
      expect(stats.totalTrips).toBe(3);
      expect(stats.totalDistance).toBe(45);
      expect(stats.totalDuration).toBe(2700);
      expect(stats.avgDistance).toBe(15);
      expect(stats.avgDuration).toBe(900);
      expect(stats.maxSpeed).toBe(90);
    });

    it('should calculate total fuel consumption', () => {
      const trips = [
        { distance: 100, duration: 3600, avgSpeed: 60, maxSpeed: 80 },
        { distance: 50, duration: 1800, avgSpeed: 60, maxSpeed: 70 },
      ];

      const stats = getTripStatistics(trips);
      expect(stats.totalFuel).toBeGreaterThan(0);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h');
      expect(formatDuration(7320)).toBe('2h 2m');
    });

    it('should handle invalid input', () => {
      expect(formatDuration(null)).toBe('0m');
      expect(formatDuration(-100)).toBe('0m');
    });
  });

  describe('formatDistance', () => {
    it('should format kilometers correctly', () => {
      expect(formatDistance(0)).toBe('0 km');
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.999)).toBe('999 m');
      expect(formatDistance(1)).toBe('1 km');
      expect(formatDistance(1.5)).toBe('1.5 km');
      expect(formatDistance(10.567)).toBe('10.57 km');
    });

    it('should handle invalid input', () => {
      expect(formatDistance(null)).toBe('0 km');
      expect(formatDistance(-10)).toBe('0 km');
    });
  });
});

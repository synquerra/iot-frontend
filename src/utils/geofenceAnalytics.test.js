// src/utils/geofenceAnalytics.test.js
import { describe, it, expect } from 'vitest';
import {
  detectGeofenceEvents,
  calculateTimeInZone,
  getGeofenceViolations,
  getMostVisitedZones,
  calculateRouteEfficiency,
  getGeofenceStatistics,
  formatDuration
} from './geofenceAnalytics';

describe('geofenceAnalytics', () => {
  const circleGeofence = {
    id: 'zone1',
    name: 'Zone 1',
    type: 'circle',
    center: { lat: 40.7128, lng: -74.0060 },
    radius: 1000 // 1km
  };

  const polygonGeofence = {
    id: 'zone2',
    name: 'Zone 2',
    type: 'polygon',
    coordinates: [
      { lat: 40.7100, lng: -74.0100 },
      { lat: 40.7200, lng: -74.0100 },
      { lat: 40.7200, lng: -74.0000 },
      { lat: 40.7100, lng: -74.0000 }
    ]
  };

  describe('detectGeofenceEvents', () => {
    it('should return empty array for no data', () => {
      expect(detectGeofenceEvents([], [circleGeofence])).toEqual([]);
      expect(detectGeofenceEvents(null, [circleGeofence])).toEqual([]);
      expect(detectGeofenceEvents([{ latitude: 40.7128, longitude: -74.0060 }], [])).toEqual([]);
    });

    it('should detect entry event', () => {
      const data = [
        { latitude: 40.7000, longitude: -74.0000, timestamp: '2024-01-01T10:00:00Z', imei: '123' }, // Outside
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:01:00Z', imei: '123' }  // Inside
      ];

      const events = detectGeofenceEvents(data, [circleGeofence]);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('entry');
      expect(events[0].geofence.id).toBe('zone1');
    });

    it('should detect exit event', () => {
      const data = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z', imei: '123' }, // Inside
        { latitude: 40.7500, longitude: -74.0500, timestamp: '2024-01-01T10:01:00Z', imei: '123' }  // Outside
      ];

      const events = detectGeofenceEvents(data, [circleGeofence]);
      const exitEvents = events.filter(e => e.type === 'exit');
      expect(exitEvents.length).toBeGreaterThan(0);
    });

    it('should handle multiple geofences', () => {
      const data = [
        { latitude: 40.7000, longitude: -74.0000, timestamp: '2024-01-01T10:00:00Z', imei: '123' },
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:01:00Z', imei: '123' },
        { latitude: 40.7150, longitude: -74.0050, timestamp: '2024-01-01T10:02:00Z', imei: '123' }
      ];

      const events = detectGeofenceEvents(data, [circleGeofence, polygonGeofence]);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('calculateTimeInZone', () => {
    it('should return zeros for no data', () => {
      const result = calculateTimeInZone([], circleGeofence);
      expect(result.totalTime).toBe(0);
      expect(result.visits).toBe(0);
    });

    it('should calculate time spent in zone', () => {
      const data = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z' }, // Inside
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:05:00Z' }, // Inside (5 min later)
        { latitude: 40.7500, longitude: -74.0500, timestamp: '2024-01-01T10:10:00Z' }  // Outside
      ];

      const result = calculateTimeInZone(data, circleGeofence);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.visits).toBeGreaterThan(0);
    });

    it('should count multiple visits', () => {
      const data = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:00:00Z' }, // Visit 1 start
        { latitude: 40.7500, longitude: -74.0500, timestamp: '2024-01-01T10:05:00Z' }, // Visit 1 end
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T11:00:00Z' }, // Visit 2 start
        { latitude: 40.7500, longitude: -74.0500, timestamp: '2024-01-01T11:05:00Z' }  // Visit 2 end
      ];

      const result = calculateTimeInZone(data, circleGeofence);
      expect(result.visits).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getGeofenceViolations', () => {
    it('should return empty array for no events', () => {
      expect(getGeofenceViolations([])).toEqual([]);
    });

    it('should detect unauthorized entry', () => {
      const events = [
        {
          type: 'entry',
          geofence: { id: 'zone1', name: 'Restricted Zone' },
          point: { speed: 30 },
          timestamp: new Date()
        }
      ];

      const rules = {
        restrictedZones: ['zone1']
      };

      const violations = getGeofenceViolations(events, rules);
      expect(violations.length).toBe(1);
      expect(violations[0].violationType).toBe('unauthorized_entry');
    });

    it('should detect speed violations', () => {
      const events = [
        {
          type: 'entry',
          geofence: { id: 'zone1', name: 'Speed Limited Zone' },
          point: { speed: 80 },
          timestamp: new Date()
        }
      ];

      const rules = {
        speedLimits: { zone1: 50 }
      };

      const violations = getGeofenceViolations(events, rules);
      expect(violations.length).toBe(1);
      expect(violations[0].violationType).toBe('speed_violation');
    });
  });

  describe('getMostVisitedZones', () => {
    it('should return empty array for no events', () => {
      expect(getMostVisitedZones([])).toEqual([]);
    });

    it('should rank zones by visit count', () => {
      const events = [
        { type: 'entry', geofence: { id: 'zone1', name: 'Zone 1' }, timestamp: new Date('2024-01-01T10:00:00Z') },
        { type: 'entry', geofence: { id: 'zone1', name: 'Zone 1' }, timestamp: new Date('2024-01-01T11:00:00Z') },
        { type: 'entry', geofence: { id: 'zone2', name: 'Zone 2' }, timestamp: new Date('2024-01-01T12:00:00Z') }
      ];

      const visited = getMostVisitedZones(events);
      expect(visited.length).toBe(2);
      expect(visited[0].geofence.id).toBe('zone1');
      expect(visited[0].visits).toBe(2);
    });
  });

  describe('calculateRouteEfficiency', () => {
    it('should return zeros for no data', () => {
      const result = calculateRouteEfficiency([], [circleGeofence]);
      expect(result.totalDistance).toBe(0);
      expect(result.efficiency).toBe(0);
    });

    it('should calculate route efficiency', () => {
      const data = [
        { latitude: 40.7100, longitude: -74.0100, timestamp: '2024-01-01T10:00:00Z' },
        { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T10:01:00Z' }, // Inside
        { latitude: 40.7200, longitude: -74.0000, timestamp: '2024-01-01T10:02:00Z' }
      ];

      const result = calculateRouteEfficiency(data, [circleGeofence]);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('getGeofenceStatistics', () => {
    it('should return zeros for no events', () => {
      const stats = getGeofenceStatistics([], []);
      expect(stats.totalEvents).toBe(0);
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalExits).toBe(0);
    });

    it('should calculate statistics', () => {
      const events = [
        { type: 'entry', geofence: { id: 'zone1', name: 'Zone 1' }, timestamp: new Date('2024-01-01T10:00:00Z') },
        { type: 'exit', geofence: { id: 'zone1', name: 'Zone 1' }, timestamp: new Date('2024-01-01T10:05:00Z') },
        { type: 'entry', geofence: { id: 'zone2', name: 'Zone 2' }, timestamp: new Date('2024-01-01T10:10:00Z') }
      ];

      const stats = getGeofenceStatistics(events, [circleGeofence, polygonGeofence]);
      expect(stats.totalEvents).toBe(3);
      expect(stats.totalEntries).toBe(2);
      expect(stats.totalExits).toBe(1);
      expect(stats.activeGeofences).toBeGreaterThan(0);
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
    });

    it('should handle invalid input', () => {
      expect(formatDuration(null)).toBe('0m');
      expect(formatDuration(-100)).toBe('0m');
    });
  });
});

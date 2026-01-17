// src/utils/deviceHealth.test.js
import { describe, it, expect } from 'vitest';
import {
  calculateHealthScore,
  getBatteryTrend,
  getSignalStrength,
  calculateUptime,
  getConnectionQuality,
  predictMaintenanceNeeds,
  formatHealthStatus
} from './deviceHealth';

describe('deviceHealth', () => {
  describe('calculateHealthScore', () => {
    it('should return zero scores for null device', () => {
      const result = calculateHealthScore(null, []);
      expect(result.overall).toBe(0);
      expect(result.status).toBe('unknown');
    });

    it('should calculate health score with default values', () => {
      const device = { imei: '123', interval: 60 };
      const result = calculateHealthScore(device, []);
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.breakdown).toHaveProperty('battery');
      expect(result.breakdown).toHaveProperty('connectivity');
      expect(result.breakdown).toHaveProperty('dataQuality');
      expect(result.breakdown).toHaveProperty('uptime');
    });

    it('should generate alerts for low scores', () => {
      const device = { imei: '123', interval: 300 };
      const analytics = [
        { battery: 15, latitude: 40.7128, longitude: -74.0060, timestamp: new Date().toISOString() }
      ];
      const result = calculateHealthScore(device, analytics);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should classify status correctly', () => {
      const device = { imei: '123', interval: 20 };
      const analytics = Array.from({ length: 100 }, (_, i) => ({
        battery: 90,
        latitude: 40.7128 + i * 0.001,
        longitude: -74.0060 + i * 0.001,
        speed: 50,
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));
      const result = calculateHealthScore(device, analytics);
      expect(['excellent', 'good']).toContain(result.status);
    });
  });

  describe('getBatteryTrend', () => {
    it('should return empty array for no data', () => {
      expect(getBatteryTrend([])).toEqual([]);
      expect(getBatteryTrend(null)).toEqual([]);
    });

    it('should extract battery trend data', () => {
      const analytics = [
        { battery: 100, timestamp: '2024-01-01T10:00:00Z', imei: '123' },
        { battery: 95, timestamp: '2024-01-01T11:00:00Z', imei: '123' },
        { battery: 90, timestamp: '2024-01-01T12:00:00Z', imei: '123' }
      ];
      const trend = getBatteryTrend(analytics);
      expect(trend).toHaveLength(3);
      expect(trend[0].battery).toBe(100);
      expect(trend[2].battery).toBe(90);
    });

    it('should sort by timestamp', () => {
      const analytics = [
        { battery: 90, timestamp: '2024-01-01T12:00:00Z', imei: '123' },
        { battery: 100, timestamp: '2024-01-01T10:00:00Z', imei: '123' },
        { battery: 95, timestamp: '2024-01-01T11:00:00Z', imei: '123' }
      ];
      const trend = getBatteryTrend(analytics);
      expect(trend[0].battery).toBe(100);
      expect(trend[1].battery).toBe(95);
      expect(trend[2].battery).toBe(90);
    });
  });

  describe('getSignalStrength', () => {
    it('should estimate signal from device interval', () => {
      const device = { interval: 20 };
      const result = getSignalStrength(device, []);
      expect(result.strength).toBe('excellent');
      expect(result.bars).toBeGreaterThan(0);
    });

    it('should calculate from signal data if available', () => {
      const device = { interval: 60 };
      const analytics = [
        { signal: 85 },
        { signal: 90 },
        { signal: 80 }
      ];
      const result = getSignalStrength(device, analytics);
      expect(result.strength).toBe('excellent');
      expect(result.percentage).toBeGreaterThan(80);
    });

    it('should return poor signal for high interval', () => {
      const device = { interval: 300 };
      const result = getSignalStrength(device, []);
      expect(result.strength).toBe('poor');
    });
  });

  describe('calculateUptime', () => {
    it('should return 0 for no data', () => {
      const device = { interval: 60 };
      expect(calculateUptime(device, [])).toBe(0);
    });

    it('should calculate uptime percentage', () => {
      const device = { interval: 60 };
      const now = new Date();
      const analytics = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(now - i * 60 * 60 * 1000).toISOString()
      }));
      const uptime = calculateUptime(device, analytics);
      expect(uptime).toBeGreaterThan(0);
      expect(uptime).toBeLessThanOrEqual(100);
    });
  });

  describe('getConnectionQuality', () => {
    it('should return unknown for no data', () => {
      const result = getConnectionQuality([]);
      expect(result.status).toBe('unknown');
      expect(result.packetLoss).toBe(0);
    });

    it('should calculate connection metrics', () => {
      const analytics = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));
      const result = getConnectionQuality(analytics);
      expect(result).toHaveProperty('packetLoss');
      expect(result).toHaveProperty('avgLatency');
      expect(result).toHaveProperty('consistency');
      expect(result).toHaveProperty('status');
    });

    it('should detect packet loss from large gaps', () => {
      const analytics = [
        { timestamp: '2024-01-01T10:00:00Z' },
        { timestamp: '2024-01-01T10:01:00Z' },
        { timestamp: '2024-01-01T10:10:00Z' }, // 9 minute gap
        { timestamp: '2024-01-01T10:11:00Z' }
      ];
      const result = getConnectionQuality(analytics);
      expect(result.packetLoss).toBeGreaterThan(0);
    });
  });

  describe('predictMaintenanceNeeds', () => {
    it('should return low confidence for insufficient data', () => {
      const result = predictMaintenanceNeeds([]);
      expect(result.needsMaintenance).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should predict maintenance for declining health', () => {
      const healthHistory = [
        { overall: 80, timestamp: new Date() },
        { overall: 70, timestamp: new Date() },
        { overall: 60, timestamp: new Date() },
        { overall: 50, timestamp: new Date() },
        { overall: 40, timestamp: new Date() }
      ];
      const result = predictMaintenanceNeeds(healthHistory);
      expect(result.needsMaintenance).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should not predict maintenance for stable health', () => {
      const healthHistory = [
        { overall: 85, timestamp: new Date() },
        { overall: 87, timestamp: new Date() },
        { overall: 86, timestamp: new Date() },
        { overall: 88, timestamp: new Date() },
        { overall: 85, timestamp: new Date() }
      ];
      const result = predictMaintenanceNeeds(healthHistory);
      expect(result.needsMaintenance).toBe(false);
    });

    it('should set critical priority for very low scores', () => {
      const healthHistory = [
        { overall: 35, timestamp: new Date() },
        { overall: 32, timestamp: new Date() },
        { overall: 30, timestamp: new Date() }
      ];
      const result = predictMaintenanceNeeds(healthHistory);
      expect(result.priority).toBe('critical');
    });
  });

  describe('formatHealthStatus', () => {
    it('should format excellent status', () => {
      const result = formatHealthStatus('excellent');
      expect(result.label).toBe('Excellent');
      expect(result.color).toBe('green');
    });

    it('should format poor status', () => {
      const result = formatHealthStatus('poor');
      expect(result.label).toBe('Poor');
      expect(result.color).toBe('red');
    });

    it('should handle unknown status', () => {
      const result = formatHealthStatus('invalid');
      expect(result.label).toBe('Unknown');
      expect(result.color).toBe('gray');
    });
  });
});

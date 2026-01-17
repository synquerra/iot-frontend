// src/utils/timeAnalytics.test.js
import { describe, it, expect } from 'vitest';
import {
  generateActivityHeatmap,
  calculatePeakHours,
  getDailyPatterns,
  compareTimePeriods,
  calculateAverageDailyDistance,
  getWeeklyTrends,
  getHourlyDistribution,
  getTimeRangeStats
} from './timeAnalytics';

describe('timeAnalytics', () => {
  describe('generateActivityHeatmap', () => {
    it('should return empty heatmap for no data', () => {
      const heatmap = generateActivityHeatmap([]);
      expect(heatmap).toHaveLength(7); // 7 days
      expect(heatmap[0].hours).toHaveLength(24); // 24 hours
      expect(heatmap[0].hours[0].count).toBe(0);
    });

    it('should generate heatmap with correct structure', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' }, // Monday 10 AM
        { timestamp: '2024-01-01T10:30:00Z' }, // Monday 10 AM
        { timestamp: '2024-01-01T14:00:00Z' }  // Monday 2 PM
      ];
      
      const heatmap = generateActivityHeatmap(data);
      expect(heatmap).toHaveLength(7);
      expect(heatmap[0].day).toBe('Sun');
      expect(heatmap[1].day).toBe('Mon');
    });

    it('should count data points correctly', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' },
        { timestamp: '2024-01-01T10:30:00Z' },
        { timestamp: '2024-01-01T10:45:00Z' }
      ];
      
      const heatmap = generateActivityHeatmap(data);
      const monday = heatmap[1]; // Monday
      expect(monday.hours[10].count).toBe(3);
    });

    it('should calculate intensity correctly', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' },
        { timestamp: '2024-01-01T10:30:00Z' },
        { timestamp: '2024-01-01T14:00:00Z' }
      ];
      
      const heatmap = generateActivityHeatmap(data);
      const monday = heatmap[1];
      expect(monday.hours[10].intensity).toBe(100); // Max intensity
      expect(monday.hours[14].intensity).toBeLessThan(100);
    });
  });

  describe('calculatePeakHours', () => {
    it('should return empty array for no data', () => {
      expect(calculatePeakHours([])).toEqual([]);
    });

    it('should identify peak hours', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({
        timestamp: `2024-01-01T10:${String(i * 5).padStart(2, '0')}:00.000Z` // 10 points at 10 AM UTC
      })).concat(
        Array.from({ length: 5 }, (_, i) => ({
          timestamp: `2024-01-01T14:${String(i * 5).padStart(2, '0')}:00.000Z` // 5 points at 2 PM UTC
        }))
      );
      
      const peaks = calculatePeakHours(data);
      expect(peaks.length).toBeGreaterThan(0);
      expect(peaks[0].count).toBeGreaterThanOrEqual(5); // Should have significant count
    });

    it('should return top 5 peak hours', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        timestamp: `2024-01-01T${i % 24}:00:00Z`
      }));
      
      const peaks = calculatePeakHours(data);
      expect(peaks.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getDailyPatterns', () => {
    it('should return empty patterns for no data', () => {
      const patterns = getDailyPatterns([]);
      expect(patterns.byDay).toEqual([]);
      expect(patterns.avgPerDay).toBe(0);
    });

    it('should calculate daily distribution', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' }, // Monday
        { timestamp: '2024-01-02T10:00:00Z' }, // Tuesday
        { timestamp: '2024-01-02T14:00:00Z' }  // Tuesday
      ];
      
      const patterns = getDailyPatterns(data);
      expect(patterns.byDay).toHaveLength(7);
      expect(patterns.byDay[1].count).toBe(1); // Monday
      expect(patterns.byDay[2].count).toBe(2); // Tuesday
    });

    it('should identify busiest and quietest days', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' }, // Monday - 1
        { timestamp: '2024-01-02T10:00:00Z' }, // Tuesday - 3
        { timestamp: '2024-01-02T14:00:00Z' },
        { timestamp: '2024-01-02T16:00:00Z' }
      ];
      
      const patterns = getDailyPatterns(data);
      expect(patterns.busiestDay.day).toBe('Tuesday');
      expect(patterns.quietestDay.day).toBe('Monday');
    });
  });

  describe('compareTimePeriods', () => {
    it('should compare two periods', () => {
      const period1 = Array.from({ length: 10 }, (_, i) => ({
        timestamp: `2024-01-01T${i}:00:00Z`
      }));
      
      const period2 = Array.from({ length: 15 }, (_, i) => ({
        timestamp: `2024-01-08T${i}:00:00Z`
      }));
      
      const comparison = compareTimePeriods(period1, period2);
      expect(comparison.period1.count).toBe(10);
      expect(comparison.period2.count).toBe(15);
      expect(comparison.change).toBe(5);
      expect(comparison.percentChange).toBe(50);
      expect(comparison.trend).toBe('up');
    });

    it('should handle empty periods', () => {
      const comparison = compareTimePeriods([], []);
      expect(comparison.change).toBe(0);
      expect(comparison.trend).toBe('stable');
    });
  });

  describe('calculateAverageDailyDistance', () => {
    it('should return 0 for no data', () => {
      expect(calculateAverageDailyDistance([])).toBe(0);
    });

    it('should calculate average distance', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z', latitude: 40.7128, longitude: -74.0060 },
        { timestamp: '2024-01-01T11:00:00Z', latitude: 40.7228, longitude: -74.0160 },
        { timestamp: '2024-01-02T10:00:00Z', latitude: 40.7328, longitude: -74.0260 }
      ];
      
      const avgDistance = calculateAverageDailyDistance(data);
      expect(avgDistance).toBeGreaterThan(0);
    });
  });

  describe('getWeeklyTrends', () => {
    it('should return empty array for no data', () => {
      expect(getWeeklyTrends([])).toEqual([]);
    });

    it('should group data by week', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' }, // Week 1
        { timestamp: '2024-01-08T10:00:00Z' }, // Week 2
        { timestamp: '2024-01-15T10:00:00Z' }  // Week 3
      ];
      
      const trends = getWeeklyTrends(data);
      expect(trends.length).toBeGreaterThan(0);
    });

    it('should calculate week-over-week changes', () => {
      const data = [
        ...Array.from({ length: 10 }, (_, i) => ({
          timestamp: `2024-01-0${i + 1}T10:00:00Z`
        })),
        ...Array.from({ length: 15 }, (_, i) => ({
          timestamp: `2024-01-${i + 8}T10:00:00Z`
        }))
      ];
      
      const trends = getWeeklyTrends(data);
      if (trends.length > 1) {
        expect(trends[1]).toHaveProperty('change');
        expect(trends[1]).toHaveProperty('percentChange');
      }
    });
  });

  describe('getHourlyDistribution', () => {
    it('should return 24 hours with zero counts for no data', () => {
      const distribution = getHourlyDistribution([]);
      expect(distribution).toHaveLength(24);
      expect(distribution[0].count).toBe(0);
    });

    it('should calculate hourly distribution', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' },
        { timestamp: '2024-01-01T10:30:00Z' },
        { timestamp: '2024-01-01T14:00:00Z' }
      ];
      
      const distribution = getHourlyDistribution(data);
      expect(distribution).toHaveLength(24);
      expect(distribution[10].count).toBe(2);
      expect(distribution[14].count).toBe(1);
    });

    it('should calculate percentages correctly', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00Z' },
        { timestamp: '2024-01-01T10:30:00Z' },
        { timestamp: '2024-01-01T14:00:00Z' },
        { timestamp: '2024-01-01T14:30:00Z' }
      ];
      
      const distribution = getHourlyDistribution(data);
      expect(distribution[10].percentage).toBe(50);
      expect(distribution[14].percentage).toBe(50);
    });
  });

  describe('getTimeRangeStats', () => {
    it('should calculate stats for time range', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00.000Z' },
        { timestamp: '2024-01-02T10:00:00.000Z' },
        { timestamp: '2024-01-03T10:00:00.000Z' }
      ];
      
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-04T00:00:00.000Z');
      
      const stats = getTimeRangeStats(data, startDate, endDate);
      expect(stats.totalPoints).toBe(3);
      expect(stats.avgPerDay).toBeGreaterThan(0);
    });

    it('should filter data by date range', () => {
      const data = [
        { timestamp: '2024-01-01T10:00:00.000Z' },
        { timestamp: '2024-01-05T10:00:00.000Z' },
        { timestamp: '2024-01-10T10:00:00.000Z' }
      ];
      
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-06T00:00:00.000Z');
      
      const stats = getTimeRangeStats(data, startDate, endDate);
      expect(stats.totalPoints).toBe(2); // Only first two points
    });
  });
});

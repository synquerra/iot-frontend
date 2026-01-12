// src/utils/mapPerformanceMonitor.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapPerformanceMonitor from './mapPerformanceMonitor.js';

/**
 * Tests for MapPerformanceMonitor
 * Requirements: 6.1, 6.2, 6.3
 * 
 * Test Coverage:
 * - Metric collection for render time, data fetch, and path simplification
 * - Warning thresholds for performance targets
 * - Metric logging format and output
 */

describe('MapPerformanceMonitor', () => {
  let monitor;
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleTableSpy;

  beforeEach(() => {
    monitor = new MapPerformanceMonitor();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleTableSpy.mockRestore();
  });

  describe('Metric Collection - Initial Render Time', () => {
    // Requirements: 6.1
    it('should track initial render time', () => {
      monitor.startInitialRender();
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait ~10ms
      }
      
      const duration = monitor.endInitialRender();
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('should return 0 for render time before tracking ends', () => {
      monitor.startInitialRender();
      
      const renderTime = monitor.getRenderTime();
      
      expect(renderTime).toBe(0);
    });

    it('should return correct render time after tracking ends', () => {
      monitor.startInitialRender();
      const duration = monitor.endInitialRender();
      
      const renderTime = monitor.getRenderTime();
      
      expect(renderTime).toBe(duration);
      expect(renderTime).toBeGreaterThan(0);
    });

    it('should log render time when tracking ends', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Map initial render: \d+\.\d+ms/)
      );
    });

    it('should collect render metrics multiple times', () => {
      // First render
      monitor.startInitialRender();
      monitor.endInitialRender();
      const firstRender = monitor.getRenderTime();
      
      // Reset and second render
      monitor.reset();
      monitor.startInitialRender();
      monitor.endInitialRender();
      const secondRender = monitor.getRenderTime();
      
      expect(firstRender).toBeGreaterThan(0);
      expect(secondRender).toBeGreaterThan(0);
    });
  });

  describe('Metric Collection - Data Fetch Time', () => {
    // Requirements: 6.2
    it('should track data fetch time', () => {
      monitor.startDataFetch();
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait ~10ms
      }
      
      const duration = monitor.endDataFetch(100);
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('should return 0 for data fetch time before tracking ends', () => {
      monitor.startDataFetch();
      
      const fetchTime = monitor.getDataFetchTime();
      
      expect(fetchTime).toBe(0);
    });

    it('should return correct data fetch time after tracking ends', () => {
      monitor.startDataFetch();
      const duration = monitor.endDataFetch(50);
      
      const fetchTime = monitor.getDataFetchTime();
      
      expect(fetchTime).toBe(duration);
      expect(fetchTime).toBeGreaterThan(0);
    });

    it('should log data fetch time and size', () => {
      monitor.startDataFetch();
      monitor.endDataFetch(250);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Location data fetched: 250 points in \d+\.\d+ms/)
      );
    });

    it('should store total points count', () => {
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalPoints).toBe(500);
    });

    it('should handle data fetch with 0 points', () => {
      monitor.startDataFetch();
      const duration = monitor.endDataFetch(0);
      
      expect(duration).toBeGreaterThan(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Location data fetched: 0 points/)
      );
    });
  });

  describe('Metric Collection - Path Simplification Time', () => {
    // Requirements: 6.2
    it('should track path simplification time', () => {
      monitor.startPathSimplification();
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait ~10ms
      }
      
      const duration = monitor.endPathSimplification(1000, 100);
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('should return 0 for path simplification time before tracking ends', () => {
      monitor.startPathSimplification();
      
      const simplificationTime = monitor.getPathSimplificationTime();
      
      expect(simplificationTime).toBe(0);
    });

    it('should return correct path simplification time after tracking ends', () => {
      monitor.startPathSimplification();
      const duration = monitor.endPathSimplification(500, 50);
      
      const simplificationTime = monitor.getPathSimplificationTime();
      
      expect(simplificationTime).toBe(duration);
      expect(simplificationTime).toBeGreaterThan(0);
    });

    it('should log path simplification details', () => {
      monitor.startPathSimplification();
      monitor.endPathSimplification(1000, 100);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Path simplified: 1000 → 100 points in \d+\.\d+ms/)
      );
    });

    it('should store original and simplified point counts', () => {
      monitor.startPathSimplification();
      monitor.endPathSimplification(800, 80);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalPoints).toBe(800);
      expect(metrics.renderedPoints).toBe(80);
    });

    it('should handle path simplification with no reduction', () => {
      monitor.startPathSimplification();
      const duration = monitor.endPathSimplification(50, 50);
      
      expect(duration).toBeGreaterThan(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Path simplified: 50 → 50 points/)
      );
    });
  });

  describe('Metric Collection - Additional Metrics', () => {
    // Requirements: 6.4
    it('should track marker count', () => {
      monitor.setMarkerCount(15);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.markerCount).toBe(15);
      expect(consoleLogSpy).toHaveBeenCalledWith('Map markers rendered: 15');
    });

    it('should track map type', () => {
      monitor.setMapType('lightweight');
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.mapType).toBe('lightweight');
    });

    it('should track point counts', () => {
      monitor.setPointCounts(1000, 100);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalPoints).toBe(1000);
      expect(metrics.renderedPoints).toBe(100);
    });

    it('should calculate reduction percentage', () => {
      monitor.setPointCounts(1000, 100);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.reductionPercent).toBe(90);
    });

    it('should handle 0 total points for reduction percentage', () => {
      monitor.setPointCounts(0, 0);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.reductionPercent).toBe(0);
    });

    it('should handle no reduction case', () => {
      monitor.setPointCounts(100, 100);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.reductionPercent).toBe(0);
    });
  });

  describe('Warning Thresholds - Initial Render', () => {
    // Requirements: 6.3
    it('should not warn when render time is under target', () => {
      monitor.startInitialRender();
      // Immediately end (should be < 2000ms)
      monitor.endInitialRender();
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn when render time exceeds 2000ms target', () => {
      // Mock performance.now to simulate slow render
      const performanceNowSpy = vi.spyOn(performance, 'now');
      let callCount = 0;
      performanceNowSpy.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 2500; // 2500ms elapsed
      });
      
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Map render exceeded target \(2000ms\): 2500\.00ms/)
      );
      
      performanceNowSpy.mockRestore();
    });

    it('should log exact duration in warning message', () => {
      const performanceNowSpy = vi.spyOn(performance, 'now');
      let callCount = 0;
      performanceNowSpy.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 3250; // 3250ms elapsed
      });
      
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('3250.00ms')
      );
      
      performanceNowSpy.mockRestore();
    });
  });

  describe('Warning Thresholds - Data Fetch', () => {
    // Requirements: 6.3
    it('should not warn when data fetch time is under target', () => {
      monitor.startDataFetch();
      // Immediately end (should be < 1000ms)
      monitor.endDataFetch(100);
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn when data fetch time exceeds 1000ms target', () => {
      let callCount = 0;
      const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 1500; // 1500ms elapsed
      });
      
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Data fetch exceeded target \(1000ms\): 1500\.00ms/)
      );
      
      nowSpy.mockRestore();
    });

    it('should log exact duration in warning message', () => {
      let callCount = 0;
      const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 2100; // 2100ms elapsed
      });
      
      monitor.startDataFetch();
      monitor.endDataFetch(1000);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('2100.00ms')
      );
      
      nowSpy.mockRestore();
    });
  });

  describe('Warning Thresholds - Path Simplification', () => {
    // Requirements: 6.3
    it('should not warn when path simplification time is under target', () => {
      monitor.startPathSimplification();
      // Immediately end (should be < 500ms)
      monitor.endPathSimplification(1000, 100);
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn when path simplification time exceeds 500ms target', () => {
      let callCount = 0;
      const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 750; // 750ms elapsed
      });
      
      monitor.startPathSimplification();
      monitor.endPathSimplification(2000, 200);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Path simplification exceeded target \(500ms\): 750\.00ms/)
      );
      
      nowSpy.mockRestore();
    });

    it('should log exact duration in warning message', () => {
      let callCount = 0;
      const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 890; // 890ms elapsed
      });
      
      monitor.startPathSimplification();
      monitor.endPathSimplification(1500, 150);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('890.00ms')
      );
      
      nowSpy.mockRestore();
    });
  });

  describe('Metric Logging Format', () => {
    // Requirements: 6.1, 6.2, 6.3
    it('should log metrics in table format', () => {
      monitor.setMapType('interactive');
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      monitor.startPathSimplification();
      monitor.endPathSimplification(500, 50);
      monitor.setMarkerCount(20);
      
      monitor.logMetrics();
      
      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it('should include all key metrics in log output', () => {
      monitor.setMapType('lightweight');
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.setPointCounts(1000, 100);
      monitor.setMarkerCount(15);
      
      monitor.logMetrics();
      
      const tableCall = consoleTableSpy.mock.calls[0][0];
      
      expect(tableCall).toHaveProperty('Map Type');
      expect(tableCall).toHaveProperty('Initial Render');
      expect(tableCall).toHaveProperty('Data Fetch');
      expect(tableCall).toHaveProperty('Path Simplification');
      expect(tableCall).toHaveProperty('Total Points');
      expect(tableCall).toHaveProperty('Rendered Points');
      expect(tableCall).toHaveProperty('Marker Count');
      expect(tableCall).toHaveProperty('Point Reduction');
    });

    it('should format render time with 2 decimal places', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      monitor.logMetrics();
      
      const tableCall = consoleTableSpy.mock.calls[0][0];
      
      expect(tableCall['Initial Render']).toMatch(/\d+\.\d{2}ms/);
    });

    it('should show N/A for metrics not collected', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      monitor.logMetrics();
      
      const tableCall = consoleTableSpy.mock.calls[0][0];
      
      expect(tableCall['Data Fetch']).toBe('N/A');
      expect(tableCall['Path Simplification']).toBe('N/A');
    });

    it('should format point reduction as percentage', () => {
      monitor.setPointCounts(1000, 100);
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      monitor.logMetrics();
      
      const tableCall = consoleTableSpy.mock.calls[0][0];
      
      expect(tableCall['Point Reduction']).toBe('90.0%');
    });

    it('should log section headers', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      monitor.logMetrics();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('\n=== Map Performance Metrics ===');
      expect(consoleLogSpy).toHaveBeenCalledWith('================================\n');
    });

    it('should log warnings for missed targets', () => {
      let callCount = 0;
      const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        if (callCount === 2) return 2500; // Render: 2500ms
        if (callCount === 3) return 2500;
        if (callCount === 4) return 4000; // Fetch: 1500ms
        return 4000;
      });
      
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      
      monitor.logMetrics();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Performance targets missed:');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Initial render: 2500\.00ms \(target: 2000ms\)/)
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Data fetch: 1500\.00ms \(target: 1000ms\)/)
      );
      
      nowSpy.mockRestore();
    });

    it('should not log warnings when all targets are met', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.startDataFetch();
      monitor.endDataFetch(100);
      
      monitor.logMetrics();
      
      // Should have table and section headers, but no warnings
      const warnCalls = consoleWarnSpy.mock.calls.filter(call => 
        call[0].includes('Performance targets missed')
      );
      expect(warnCalls.length).toBe(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all metrics to initial state', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      monitor.setMarkerCount(20);
      monitor.setMapType('interactive');
      
      monitor.reset();
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.renderTime).toBe(0);
      expect(metrics.dataFetchTime).toBe(0);
      expect(metrics.pathSimplificationTime).toBe(0);
      expect(metrics.totalPoints).toBe(0);
      expect(metrics.renderedPoints).toBe(0);
      expect(metrics.markerCount).toBe(0);
      expect(metrics.mapType).toBe('unknown');
    });

    it('should allow new measurements after reset', () => {
      monitor.startInitialRender();
      monitor.endInitialRender();
      
      monitor.reset();
      
      monitor.startInitialRender();
      const duration = monitor.endInitialRender();
      
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(monitor.getRenderTime()).toBe(duration);
    });
  });

  describe('Get Metrics', () => {
    it('should return all collected metrics', () => {
      monitor.setMapType('interactive');
      monitor.startInitialRender();
      monitor.endInitialRender();
      monitor.startDataFetch();
      monitor.endDataFetch(500);
      monitor.startPathSimplification();
      monitor.endPathSimplification(500, 50);
      monitor.setMarkerCount(20);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics).toHaveProperty('renderTime');
      expect(metrics).toHaveProperty('dataFetchTime');
      expect(metrics).toHaveProperty('pathSimplificationTime');
      expect(metrics).toHaveProperty('totalPoints');
      expect(metrics).toHaveProperty('renderedPoints');
      expect(metrics).toHaveProperty('markerCount');
      expect(metrics).toHaveProperty('mapType');
      expect(metrics).toHaveProperty('reductionPercent');
    });

    it('should return correct metric values', () => {
      monitor.setMapType('lightweight');
      monitor.setPointCounts(1000, 100);
      monitor.setMarkerCount(15);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalPoints).toBe(1000);
      expect(metrics.renderedPoints).toBe(100);
      expect(metrics.markerCount).toBe(15);
      expect(metrics.mapType).toBe('lightweight');
      expect(metrics.reductionPercent).toBe(90);
    });

    it('should return 0 for uncollected metrics', () => {
      const metrics = monitor.getMetrics();
      
      expect(metrics.renderTime).toBe(0);
      expect(metrics.dataFetchTime).toBe(0);
      expect(metrics.pathSimplificationTime).toBe(0);
      expect(metrics.totalPoints).toBe(0);
      expect(metrics.renderedPoints).toBe(0);
      expect(metrics.markerCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple start calls without end', () => {
      monitor.startInitialRender();
      monitor.startInitialRender(); // Second start
      
      const duration = monitor.endInitialRender();
      
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle end call without start', () => {
      const duration = monitor.endInitialRender();
      
      // Should still work, just with 0 start time
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle very fast operations', () => {
      monitor.startInitialRender();
      const duration = monitor.endInitialRender();
      
      // Should be >= 0, even if very fast
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative point counts gracefully', () => {
      monitor.setPointCounts(-10, -5);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalPoints).toBe(-10);
      expect(metrics.renderedPoints).toBe(-5);
    });

    it('should handle zero marker count', () => {
      monitor.setMarkerCount(0);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.markerCount).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith('Map markers rendered: 0');
    });
  });
});

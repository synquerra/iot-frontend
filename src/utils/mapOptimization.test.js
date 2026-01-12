// src/utils/mapOptimization.test.js
import { describe, it, expect } from 'vitest';
import { simplifyPath, clusterMarkers } from './mapOptimization.js';

/**
 * Helper function to generate test paths with specified number of points
 * Creates a path that follows a sine wave pattern for realistic testing
 */
function generateTestPath(numPoints, latStart = 40.0, lngStart = -74.0) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    points.push({
      lat: latStart + progress * 0.1 + Math.sin(progress * Math.PI * 4) * 0.01,
      lng: lngStart + progress * 0.1 + Math.cos(progress * Math.PI * 4) * 0.01,
      time: new Date(Date.now() + i * 60000).toISOString()
    });
  }
  return points;
}

/**
 * Helper function to generate a straight line path
 */
function generateStraightPath(numPoints, latStart = 40.0, lngStart = -74.0) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    points.push({
      lat: latStart + progress * 0.1,
      lng: lngStart + progress * 0.1,
      time: new Date(Date.now() + i * 60000).toISOString()
    });
  }
  return points;
}

describe('Path Simplification', () => {
  describe('simplifyPath with various path sizes', () => {
    it('should handle small paths (10 points) without modification', () => {
      const path = generateTestPath(10);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBe(10);
      expect(simplified).toEqual(path);
    });

    it('should reduce medium paths (100 points) when target is lower', () => {
      const path = generateTestPath(100);
      const simplified = simplifyPath(path, 50);
      
      expect(simplified.length).toBeLessThanOrEqual(50);
      expect(simplified.length).toBeGreaterThan(10); // Should keep reasonable detail
    });

    it('should significantly reduce large paths (1000 points)', () => {
      const path = generateTestPath(1000);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBeLessThanOrEqual(100);
      expect(simplified.length).toBeGreaterThan(20); // Should keep some detail
      
      // Verify reduction percentage
      const reductionPercent = ((1000 - simplified.length) / 1000) * 100;
      expect(reductionPercent).toBeGreaterThan(50); // At least 50% reduction
    });

    it('should handle paths exactly at target size', () => {
      const path = generateTestPath(100);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBe(100);
      expect(simplified).toEqual(path);
    });

    it('should handle very small paths (2 points)', () => {
      const path = generateTestPath(2);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBe(2);
      expect(simplified).toEqual(path);
    });
  });

  describe('Start and end point preservation', () => {
    it('should always preserve start point for 10 point path', () => {
      const path = generateTestPath(10);
      const simplified = simplifyPath(path, 5);
      
      expect(simplified[0]).toEqual(path[0]);
    });

    it('should always preserve end point for 10 point path', () => {
      const path = generateTestPath(10);
      const simplified = simplifyPath(path, 5);
      
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });

    it('should always preserve start point for 100 point path', () => {
      const path = generateTestPath(100);
      const simplified = simplifyPath(path, 50);
      
      expect(simplified[0]).toEqual(path[0]);
    });

    it('should always preserve end point for 100 point path', () => {
      const path = generateTestPath(100);
      const simplified = simplifyPath(path, 50);
      
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });

    it('should always preserve start point for 1000 point path', () => {
      const path = generateTestPath(1000);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified[0]).toEqual(path[0]);
    });

    it('should always preserve end point for 1000 point path', () => {
      const path = generateTestPath(1000);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });

    it('should preserve start and end for straight line paths', () => {
      const path = generateStraightPath(500);
      const simplified = simplifyPath(path, 50);
      
      expect(simplified[0]).toEqual(path[0]);
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });
  });

  describe('Adaptive tolerance calculation', () => {
    it('should use different tolerance for different path sizes', () => {
      const smallPath = generateTestPath(100);
      const largePath = generateTestPath(1000);
      
      const simplifiedSmall = simplifyPath(smallPath, 50);
      const simplifiedLarge = simplifyPath(largePath, 50);
      
      // Both should be reduced to approximately the target
      expect(simplifiedSmall.length).toBeLessThanOrEqual(50);
      expect(simplifiedLarge.length).toBeLessThanOrEqual(50);
      
      // Large path should have more aggressive reduction
      const smallReduction = (100 - simplifiedSmall.length) / 100;
      const largeReduction = (1000 - simplifiedLarge.length) / 1000;
      expect(largeReduction).toBeGreaterThan(smallReduction);
    });

    it('should adapt tolerance based on geographic bounds', () => {
      // Create two paths with different geographic spreads
      const compactPath = generateTestPath(500, 40.0, -74.0); // Small area
      const widePath = generateTestPath(500, 40.0, -74.0).map((p, i) => ({
        ...p,
        lat: p.lat * 2, // Double the spread
        lng: p.lng * 2
      }));
      
      const simplifiedCompact = simplifyPath(compactPath, 50);
      const simplifiedWide = simplifyPath(widePath, 50);
      
      // Both should be reduced to approximately the target
      expect(simplifiedCompact.length).toBeLessThanOrEqual(50);
      expect(simplifiedWide.length).toBeLessThanOrEqual(50);
    });

    it('should handle paths with minimal geographic variation', () => {
      // Create a path where all points are very close together
      const tightPath = Array.from({ length: 200 }, (_, i) => ({
        lat: 40.0 + i * 0.00001,
        lng: -74.0 + i * 0.00001,
        time: new Date(Date.now() + i * 60000).toISOString()
      }));
      
      const simplified = simplifyPath(tightPath, 50);
      
      expect(simplified.length).toBeLessThanOrEqual(50);
      expect(simplified[0]).toEqual(tightPath[0]);
      expect(simplified[simplified.length - 1]).toEqual(tightPath[tightPath.length - 1]);
    });

    it('should return original path when target is greater than path length', () => {
      const path = generateTestPath(50);
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBe(50);
      expect(simplified).toEqual(path);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const simplified = simplifyPath([], 100);
      expect(simplified).toEqual([]);
    });

    it('should handle null input', () => {
      const simplified = simplifyPath(null, 100);
      expect(simplified).toEqual([]);
    });

    it('should handle undefined input', () => {
      const simplified = simplifyPath(undefined, 100);
      expect(simplified).toEqual([]);
    });

    it('should handle single point path', () => {
      const path = [{ lat: 40.0, lng: -74.0, time: new Date().toISOString() }];
      const simplified = simplifyPath(path, 100);
      
      expect(simplified.length).toBe(1);
      expect(simplified).toEqual(path);
    });

    it('should use default maxPoints when not specified', () => {
      const path = generateTestPath(200);
      const simplified = simplifyPath(path);
      
      expect(simplified.length).toBeLessThanOrEqual(100); // Default is 100
    });

    it('should handle paths with duplicate consecutive points', () => {
      const path = [
        { lat: 40.0, lng: -74.0, time: '2024-01-01T00:00:00Z' },
        { lat: 40.0, lng: -74.0, time: '2024-01-01T00:01:00Z' },
        { lat: 40.1, lng: -74.1, time: '2024-01-01T00:02:00Z' },
        { lat: 40.1, lng: -74.1, time: '2024-01-01T00:03:00Z' },
        { lat: 40.2, lng: -74.2, time: '2024-01-01T00:04:00Z' }
      ];
      
      const simplified = simplifyPath(path, 3);
      
      expect(simplified.length).toBeGreaterThanOrEqual(2);
      expect(simplified[0]).toEqual(path[0]);
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });
  });

  describe('Shape preservation', () => {
    it('should preserve general path direction', () => {
      const path = generateTestPath(500);
      const simplified = simplifyPath(path, 50);
      
      // Check that simplified path maintains general direction
      // by verifying that intermediate points are between start and end
      const startLat = path[0].lat;
      const endLat = path[path.length - 1].lat;
      const minLat = Math.min(startLat, endLat);
      const maxLat = Math.max(startLat, endLat);
      
      simplified.forEach(point => {
        expect(point.lat).toBeGreaterThanOrEqual(minLat - 0.02); // Small tolerance
        expect(point.lat).toBeLessThanOrEqual(maxLat + 0.02);
      });
    });

    it('should keep important turning points', () => {
      // Create a path with a sharp turn
      const path = [
        { lat: 40.0, lng: -74.0, time: '2024-01-01T00:00:00Z' },
        ...Array.from({ length: 50 }, (_, i) => ({
          lat: 40.0 + i * 0.001,
          lng: -74.0,
          time: new Date(Date.now() + i * 60000).toISOString()
        })),
        // Sharp turn
        ...Array.from({ length: 50 }, (_, i) => ({
          lat: 40.05,
          lng: -74.0 + i * 0.001,
          time: new Date(Date.now() + (50 + i) * 60000).toISOString()
        }))
      ];
      
      const simplified = simplifyPath(path, 20);
      
      // Should keep more than just start and end
      expect(simplified.length).toBeGreaterThan(2);
      
      // Should preserve start and end
      expect(simplified[0]).toEqual(path[0]);
      expect(simplified[simplified.length - 1]).toEqual(path[path.length - 1]);
    });
  });
});

describe('Marker Clustering', () => {
  describe('Clustering with different point counts', () => {
    it('should return all points as markers when count is below max', () => {
      const points = generateTestPath(10);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBe(10);
      markers.forEach((marker, i) => {
        expect(marker.type).toBe('marker');
        expect(marker.point).toEqual(points[i]);
      });
    });

    it('should return all points when count equals max', () => {
      const points = generateTestPath(20);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBe(20);
      markers.forEach((marker, i) => {
        expect(marker.type).toBe('marker');
        expect(marker.point).toEqual(points[i]);
      });
    });

    it('should cluster when point count exceeds max (50 points, max 20)', () => {
      const points = generateTestPath(50);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBeLessThanOrEqual(20);
      expect(markers.length).toBeGreaterThan(2); // At least start and end
    });

    it('should cluster when point count exceeds max (100 points, max 20)', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBeLessThanOrEqual(20);
      expect(markers.length).toBeGreaterThan(2);
    });

    it('should cluster when point count exceeds max (500 points, max 20)', () => {
      const points = generateTestPath(500);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBeLessThanOrEqual(20);
      expect(markers.length).toBeGreaterThan(2);
    });

    it('should cluster when point count exceeds max (1000 points, max 20)', () => {
      const points = generateTestPath(1000);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBeLessThanOrEqual(20);
      expect(markers.length).toBeGreaterThan(2);
    });

    it('should handle very small max marker limits', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 5);
      
      expect(markers.length).toBeLessThanOrEqual(5);
      expect(markers.length).toBeGreaterThanOrEqual(2); // At least start and end
    });

    it('should handle edge case of max markers = 2', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 2);
      
      expect(markers.length).toBe(2);
      // Should only have start and end
      expect(markers[0].label).toBe('Start');
      expect(markers[1].label).toBe('End');
    });
  });

  describe('Max marker limit verification', () => {
    it('should never exceed max marker limit with 50 points', () => {
      const points = generateTestPath(50);
      const maxMarkers = 10;
      const markers = clusterMarkers(points, maxMarkers);
      
      expect(markers.length).toBeLessThanOrEqual(maxMarkers);
    });

    it('should never exceed max marker limit with 100 points', () => {
      const points = generateTestPath(100);
      const maxMarkers = 15;
      const markers = clusterMarkers(points, maxMarkers);
      
      expect(markers.length).toBeLessThanOrEqual(maxMarkers);
    });

    it('should never exceed max marker limit with 500 points', () => {
      const points = generateTestPath(500);
      const maxMarkers = 20;
      const markers = clusterMarkers(points, maxMarkers);
      
      expect(markers.length).toBeLessThanOrEqual(maxMarkers);
    });

    it('should never exceed max marker limit with 1000 points', () => {
      const points = generateTestPath(1000);
      const maxMarkers = 25;
      const markers = clusterMarkers(points, maxMarkers);
      
      expect(markers.length).toBeLessThanOrEqual(maxMarkers);
    });

    it('should respect default max markers (20) when not specified', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points);
      
      expect(markers.length).toBeLessThanOrEqual(20);
    });

    it('should respect max marker limit across various sizes', () => {
      const testCases = [
        { points: 30, max: 10 },
        { points: 75, max: 15 },
        { points: 200, max: 20 },
        { points: 500, max: 25 },
        { points: 1000, max: 30 }
      ];

      testCases.forEach(({ points: count, max }) => {
        const points = generateTestPath(count);
        const markers = clusterMarkers(points, max);
        expect(markers.length).toBeLessThanOrEqual(max);
      });
    });
  });

  describe('Start and end marker preservation', () => {
    it('should always preserve start marker with label', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 20);
      
      expect(markers[0].type).toBe('marker');
      expect(markers[0].point).toEqual(points[0]);
      expect(markers[0].label).toBe('Start');
    });

    it('should always preserve end marker with label', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 20);
      
      const lastMarker = markers[markers.length - 1];
      expect(lastMarker.type).toBe('marker');
      expect(lastMarker.point).toEqual(points[points.length - 1]);
      expect(lastMarker.label).toBe('End');
    });

    it('should preserve start and end for small datasets', () => {
      const points = generateTestPath(5);
      const markers = clusterMarkers(points, 20);
      
      expect(markers[0].point).toEqual(points[0]);
      expect(markers[markers.length - 1].point).toEqual(points[points.length - 1]);
    });

    it('should preserve start and end for large datasets', () => {
      const points = generateTestPath(1000);
      const markers = clusterMarkers(points, 20);
      
      expect(markers[0].type).toBe('marker');
      expect(markers[0].point).toEqual(points[0]);
      expect(markers[0].label).toBe('Start');
      
      const lastMarker = markers[markers.length - 1];
      expect(lastMarker.type).toBe('marker');
      expect(lastMarker.point).toEqual(points[points.length - 1]);
      expect(lastMarker.label).toBe('End');
    });

    it('should preserve start and end with minimal max markers', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 3);
      
      expect(markers[0].label).toBe('Start');
      expect(markers[0].point).toEqual(points[0]);
      
      const lastMarker = markers[markers.length - 1];
      expect(lastMarker.label).toBe('End');
      expect(lastMarker.point).toEqual(points[points.length - 1]);
    });

    it('should only label start and end markers, not intermediate ones', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 10);
      
      expect(markers[0].label).toBe('Start');
      expect(markers[markers.length - 1].label).toBe('End');
      
      // Check intermediate markers don't have labels
      for (let i = 1; i < markers.length - 1; i++) {
        expect(markers[i].label).toBeUndefined();
      }
    });

    it('should preserve start and end even when they are identical', () => {
      const points = [
        { lat: 40.0, lng: -74.0, time: '2024-01-01T00:00:00Z' },
        { lat: 40.1, lng: -74.1, time: '2024-01-01T00:01:00Z' },
        { lat: 40.0, lng: -74.0, time: '2024-01-01T00:02:00Z' } // Same as start
      ];
      const markers = clusterMarkers(points, 20);
      
      expect(markers[0].point).toEqual(points[0]);
      expect(markers[markers.length - 1].point).toEqual(points[points.length - 1]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const markers = clusterMarkers([], 20);
      expect(markers).toEqual([]);
    });

    it('should handle null input', () => {
      const markers = clusterMarkers(null, 20);
      expect(markers).toEqual([]);
    });

    it('should handle undefined input', () => {
      const markers = clusterMarkers(undefined, 20);
      expect(markers).toEqual([]);
    });

    it('should handle single point', () => {
      const points = [{ lat: 40.0, lng: -74.0, time: '2024-01-01T00:00:00Z' }];
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBe(1);
      expect(markers[0].type).toBe('marker');
      expect(markers[0].point).toEqual(points[0]);
    });

    it('should handle two points', () => {
      const points = generateTestPath(2);
      const markers = clusterMarkers(points, 20);
      
      expect(markers.length).toBe(2);
      expect(markers[0].point).toEqual(points[0]);
      expect(markers[1].point).toEqual(points[1]);
    });

    it('should use default max markers when not specified', () => {
      const points = generateTestPath(50);
      const markers = clusterMarkers(points);
      
      expect(markers.length).toBeLessThanOrEqual(20); // Default is 20
    });
  });

  describe('Marker distribution', () => {
    it('should distribute intermediate markers evenly', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 10);
      
      // Should have start, end, and evenly distributed intermediate markers
      expect(markers.length).toBeLessThanOrEqual(10);
      expect(markers.length).toBeGreaterThan(2);
      
      // Verify all markers have required properties
      markers.forEach(marker => {
        expect(marker.type).toBe('marker');
        expect(marker.point).toBeDefined();
        expect(marker.point.lat).toBeDefined();
        expect(marker.point.lng).toBeDefined();
      });
    });

    it('should sample from the original points array', () => {
      const points = generateTestPath(50);
      const markers = clusterMarkers(points, 10);
      
      // Every marker point should exist in the original points array
      markers.forEach(marker => {
        const found = points.some(p => 
          p.lat === marker.point.lat && 
          p.lng === marker.point.lng
        );
        expect(found).toBe(true);
      });
    });

    it('should maintain chronological order', () => {
      const points = generateTestPath(100);
      const markers = clusterMarkers(points, 15);
      
      // Find indices of marker points in original array
      const indices = markers.map(marker => 
        points.findIndex(p => 
          p.lat === marker.point.lat && 
          p.lng === marker.point.lng
        )
      );
      
      // Indices should be in ascending order
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1]);
      }
    });
  });
});

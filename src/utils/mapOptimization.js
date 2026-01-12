/**
 * Map Optimization Utilities
 * 
 * Provides path simplification and marker clustering functions for optimizing
 * map rendering performance with large datasets.
 */

/**
 * Calculate the perpendicular distance from a point to a line segment
 * @param {Object} point - Point with lat/lng properties
 * @param {Object} lineStart - Line start point with lat/lng properties
 * @param {Object} lineEnd - Line end point with lat/lng properties
 * @returns {number} Perpendicular distance
 */
function perpendicularDistance(point, lineStart, lineEnd) {
  const { lat: x, lng: y } = point;
  const { lat: x1, lng: y1 } = lineStart;
  const { lat: x2, lng: y2 } = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // Handle case where line segment is actually a point
  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  // Calculate perpendicular distance
  const numerator = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}

/**
 * Douglas-Peucker algorithm for path simplification
 * Recursively simplifies a path by removing points that don't significantly
 * contribute to the path's shape.
 * 
 * @param {Array} points - Array of points with lat/lng properties
 * @param {number} tolerance - Distance tolerance for simplification
 * @returns {Array} Simplified array of points
 */
function douglasPeucker(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  // Find the point with maximum distance from the line segment
  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftSegment = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightSegment = douglasPeucker(points.slice(maxIndex), tolerance);

    // Combine results, removing duplicate point at junction
    return [...leftSegment.slice(0, -1), ...rightSegment];
  }

  // If max distance is less than tolerance, return just the endpoints
  return [points[0], points[end]];
}

/**
 * Calculate adaptive tolerance based on path bounds and target point count
 * @param {Array} points - Array of points with lat/lng properties
 * @param {number} targetPoints - Desired number of points after simplification
 * @returns {number} Calculated tolerance value
 */
function calculateAdaptiveTolerance(points, targetPoints) {
  if (points.length <= targetPoints) {
    return 0;
  }

  // Calculate bounding box
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const latRange = Math.max(...lats) - Math.min(...lats);
  const lngRange = Math.max(...lngs) - Math.min(...lngs);
  const maxRange = Math.max(latRange, lngRange);

  // Start with a tolerance based on the path size
  // This is a heuristic that works well for geographic coordinates
  const baseTolerance = maxRange / 1000;

  // Binary search for the right tolerance
  let low = baseTolerance * 0.1;
  let high = baseTolerance * 10;
  let bestTolerance = baseTolerance;

  for (let i = 0; i < 10; i++) {
    const mid = (low + high) / 2;
    const simplified = douglasPeucker(points, mid);

    if (simplified.length > targetPoints) {
      low = mid;
    } else if (simplified.length < targetPoints * 0.8) {
      high = mid;
    } else {
      bestTolerance = mid;
      break;
    }
    bestTolerance = mid;
  }

  return bestTolerance;
}

/**
 * Simplify a path to a target number of points while preserving shape
 * Uses Douglas-Peucker algorithm with adaptive tolerance
 * 
 * @param {Array} points - Array of points with lat/lng properties
 * @param {number} maxPoints - Maximum number of points in simplified path (default: 100)
 * @returns {Array} Simplified array of points
 */
export function simplifyPath(points, maxPoints = 100) {
  if (!points || points.length === 0) {
    return [];
  }

  if (points.length <= maxPoints) {
    return points;
  }

  const tolerance = calculateAdaptiveTolerance(points, maxPoints);
  return douglasPeucker(points, tolerance);
}

/**
 * Cluster markers to reduce the number of visible markers on the map
 * Always preserves start and end markers with labels
 * 
 * @param {Array} points - Array of points with lat/lng properties
 * @param {number} maxMarkers - Maximum number of markers to display (default: 20)
 * @returns {Array} Array of marker objects with type, point, and optional label
 */
export function clusterMarkers(points, maxMarkers = 20) {
  if (!points || points.length === 0) {
    return [];
  }

  if (points.length <= maxMarkers) {
    return points.map(p => ({ type: 'marker', point: p }));
  }

  const result = [];

  // Always show start marker
  result.push({
    type: 'marker',
    point: points[0],
    label: 'Start'
  });

  // Sample intermediate points evenly
  const remainingMarkers = maxMarkers - 2;
  if (remainingMarkers > 0) {
    const step = Math.floor((points.length - 2) / remainingMarkers);
    
    for (let i = step; i < points.length - 1; i += step) {
      if (result.length >= maxMarkers - 1) break; // Leave room for end marker
      result.push({
        type: 'marker',
        point: points[i]
      });
    }
  }

  // Always show end marker (add last to ensure it's at the end)
  result.push({
    type: 'marker',
    point: points[points.length - 1],
    label: 'End'
  });

  return result;
}

/**
 * Performance timing utility for measuring operation duration
 */
export class PerformanceTimer {
  constructor(label) {
    this.label = label;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Start the timer
   */
  start() {
    this.startTime = performance.now();
    return this;
  }

  /**
   * Stop the timer and return duration
   * @returns {number} Duration in milliseconds
   */
  stop() {
    this.endTime = performance.now();
    return this.getDuration();
  }

  /**
   * Get the duration between start and stop
   * @returns {number} Duration in milliseconds
   */
  getDuration() {
    if (this.startTime === null) {
      return 0;
    }
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  /**
   * Log the duration to console
   * @param {number} threshold - Optional threshold in ms to trigger warning
   */
  log(threshold) {
    const duration = this.getDuration();
    const message = `${this.label}: ${duration.toFixed(2)}ms`;

    if (threshold && duration > threshold) {
      console.warn(`⚠️ ${message} (exceeded ${threshold}ms threshold)`);
    } else {
      console.log(`✓ ${message}`);
    }

    return duration;
  }
}

/**
 * Measure the execution time of a function
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: any, duration: number}>} Result and duration
 */
export async function measurePerformance(label, fn) {
  const timer = new PerformanceTimer(label);
  timer.start();

  try {
    const result = await fn();
    const duration = timer.stop();
    return { result, duration };
  } catch (error) {
    timer.stop();
    throw error;
  }
}

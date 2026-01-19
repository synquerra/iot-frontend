import { describe, it, expect } from 'vitest';
import {
  validateCoordinate,
  validatePolygon,
  detectSelfIntersection,
  edgesIntersect,
  autoClosePolygon
} from './geofenceValidation';

describe('validateCoordinate', () => {
  it('should validate correct coordinates', () => {
    const result = validateCoordinate(23.301624, 85.327065);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject latitude above 90', () => {
    const result = validateCoordinate(91, 85.327065);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('latitude');
    expect(result.errors[0].message).toContain('between -90 and 90');
  });

  it('should reject latitude below -90', () => {
    const result = validateCoordinate(-91, 85.327065);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('latitude');
  });

  it('should reject longitude above 180', () => {
    const result = validateCoordinate(23.301624, 181);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('longitude');
    expect(result.errors[0].message).toContain('between -180 and 180');
  });

  it('should reject longitude below -180', () => {
    const result = validateCoordinate(23.301624, -181);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('longitude');
  });

  it('should reject non-numeric latitude', () => {
    const result = validateCoordinate('invalid', 85.327065);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain('must be a number');
  });

  it('should reject non-numeric longitude', () => {
    const result = validateCoordinate(23.301624, 'invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain('must be a number');
  });
});

describe('validatePolygon', () => {
  it('should validate polygon with minimum 3 points', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 }
    ];
    const result = validatePolygon(coords);
    expect(result.isValid).toBe(true);
  });

  it('should reject polygon with fewer than 3 points', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 }
    ];
    const result = validatePolygon(coords);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MIN_POINTS');
  });

  it('should validate closed polygon without warnings', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 },
      { latitude: 23.301624, longitude: 85.327065 }
    ];
    const result = validatePolygon(coords);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should warn about unclosed polygon', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 }
    ];
    const result = validatePolygon(coords);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe('AUTO_CLOSE');
  });

  it('should reject polygon with invalid coordinates', () => {
    const coords = [
      { latitude: 91, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 }
    ];
    const result = validatePolygon(coords);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('detectSelfIntersection', () => {
  it('should detect self-intersecting polygon', () => {
    // Creates a bowtie/figure-8 shape that intersects itself
    // Line from (0,0) to (2,2) intersects with line from (2,0) to (0,2)
    const coords = [
      { latitude: 0, longitude: 0 },
      { latitude: 2, longitude: 2 },
      { latitude: 2, longitude: 0 },
      { latitude: 0, longitude: 2 },
      { latitude: 0, longitude: 0 } // Close the polygon
    ];
    const result = detectSelfIntersection(coords);
    expect(result).toBe(true);
  });

  it('should not detect intersection in non-intersecting polygon', () => {
    const coords = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 1, longitude: 1 },
      { latitude: 1, longitude: 0 }
    ];
    const result = detectSelfIntersection(coords);
    expect(result).toBe(false);
  });

  it('should return false for polygons with fewer than 4 points', () => {
    const coords = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 1, longitude: 1 }
    ];
    const result = detectSelfIntersection(coords);
    expect(result).toBe(false);
  });
});

describe('autoClosePolygon', () => {
  it('should close an unclosed polygon', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 }
    ];
    const result = autoClosePolygon(coords);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(result[3]);
  });

  it('should not modify an already closed polygon', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 },
      { latitude: 23.301750, longitude: 85.327150 },
      { latitude: 23.301624, longitude: 85.327065 }
    ];
    const result = autoClosePolygon(coords);
    expect(result).toHaveLength(4);
    expect(result).toEqual(coords);
  });

  it('should return original array if fewer than 3 points', () => {
    const coords = [
      { latitude: 23.301624, longitude: 85.327065 },
      { latitude: 23.301700, longitude: 85.327100 }
    ];
    const result = autoClosePolygon(coords);
    expect(result).toEqual(coords);
  });
});

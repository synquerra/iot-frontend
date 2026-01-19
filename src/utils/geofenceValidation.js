/**
 * Geofence Validation Utilities
 * Provides validation functions for geofence coordinates and polygons
 */

/**
 * Validates a single coordinate pair
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {{isValid: boolean, errors: Array<{field: string, message: string}>}}
 */
export function validateCoordinate(lat, lng) {
  const errors = [];
  
  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push({ field: 'latitude', message: 'Latitude must be a number' });
  } else if (lat < -90 || lat > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
  }
  
  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push({ field: 'longitude', message: 'Longitude must be a number' });
  } else if (lng < -180 || lng > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a polygon defined by an array of coordinates
 * @param {Array<{latitude: number, longitude: number}>} coordinates - Array of coordinate objects
 * @returns {{isValid: boolean, errors: Array, warnings: Array}}
 */
export function validatePolygon(coordinates) {
  const errors = [];
  const warnings = [];
  
  // Minimum points check
  if (!coordinates || coordinates.length < 3) {
    errors.push({
      field: 'coordinates',
      message: 'Geofence must have at least 3 points',
      code: 'MIN_POINTS'
    });
    return { isValid: false, errors, warnings };
  }
  
  // Validate each coordinate
  coordinates.forEach((coord, index) => {
    if (!coord || typeof coord !== 'object') {
      errors.push({
        field: `coordinates[${index}]`,
        message: `Point ${index + 1}: Invalid coordinate object`,
        code: 'INVALID_COORDINATE'
      });
      return;
    }
    
    const validation = validateCoordinate(coord.latitude, coord.longitude);
    if (!validation.isValid) {
      validation.errors.forEach(err => {
        errors.push({
          field: `coordinates[${index}]`,
          message: `Point ${index + 1}: ${err.message}`,
          code: 'INVALID_COORDINATE'
        });
      });
    }
  });
  
  // If there are coordinate errors, return early
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }
  
  // Check if polygon is closed
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const tolerance = 0.000001;
  
  const isClosed = 
    Math.abs(first.latitude - last.latitude) < tolerance &&
    Math.abs(first.longitude - last.longitude) < tolerance;
  
  if (!isClosed) {
    warnings.push({
      field: 'coordinates',
      message: 'Polygon will be automatically closed',
      code: 'AUTO_CLOSE'
    });
  }
  
  // Check for self-intersection
  if (coordinates.length >= 4) {
    const hasSelfIntersection = detectSelfIntersection(coordinates);
    if (hasSelfIntersection) {
      warnings.push({
        field: 'coordinates',
        message: 'Polygon edges intersect themselves',
        code: 'SELF_INTERSECTION'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Detects if a polygon has self-intersecting edges
 * @param {Array<{latitude: number, longitude: number}>} coordinates - Array of coordinate objects
 * @returns {boolean} True if polygon has self-intersecting edges
 */
export function detectSelfIntersection(coordinates) {
  if (!coordinates || coordinates.length < 4) {
    return false;
  }
  
  // Check if any two non-adjacent edges intersect
  for (let i = 0; i < coordinates.length - 1; i++) {
    for (let j = i + 2; j < coordinates.length - 1; j++) {
      // Skip adjacent edges and the closing edge
      if (i === 0 && j === coordinates.length - 2) continue;
      
      const edge1 = {
        p1: coordinates[i],
        p2: coordinates[i + 1]
      };
      const edge2 = {
        p1: coordinates[j],
        p2: coordinates[j + 1]
      };
      
      if (edgesIntersect(edge1, edge2)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if two line segments intersect
 * @param {{p1: {latitude: number, longitude: number}, p2: {latitude: number, longitude: number}}} edge1 - First edge
 * @param {{p1: {latitude: number, longitude: number}, p2: {latitude: number, longitude: number}}} edge2 - Second edge
 * @returns {boolean} True if edges intersect
 */
export function edgesIntersect(edge1, edge2) {
  const { p1: a, p2: b } = edge1;
  const { p1: c, p2: d } = edge2;
  
  // Counter-clockwise helper function
  const ccw = (A, B, C) => {
    return (C.longitude - A.longitude) * (B.latitude - A.latitude) >
           (B.longitude - A.longitude) * (C.latitude - A.latitude);
  };
  
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

/**
 * Automatically closes a polygon by adding the first point as the last point if needed
 * @param {Array<{latitude: number, longitude: number}>} coordinates - Array of coordinate objects
 * @returns {Array<{latitude: number, longitude: number}>} Closed polygon coordinates
 */
export function autoClosePolygon(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return coordinates;
  }
  
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const tolerance = 0.000001;
  
  const isClosed = 
    Math.abs(first.latitude - last.latitude) < tolerance &&
    Math.abs(first.longitude - last.longitude) < tolerance;
  
  if (isClosed) {
    return coordinates;
  }
  
  // Add first point as last point to close the polygon
  return [...coordinates, { ...first }];
}

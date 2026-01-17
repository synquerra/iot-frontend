// src/utils/geofenceAnalytics.js

/**
 * Check if a point is inside a polygon geofence using ray casting algorithm
 * @private
 */
function isPointInPolygon(point, polygon) {
  const { lat, lng } = point;
  const vertices = polygon.coordinates || polygon;
  
  if (!vertices || vertices.length < 3) return false;

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].lng || vertices[i][1];
    const yi = vertices[i].lat || vertices[i][0];
    const xj = vertices[j].lng || vertices[j][1];
    const yj = vertices[j].lat || vertices[j][0];

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if a point is inside a circle geofence
 * @private
 */
function isPointInCircle(point, circle) {
  const { lat, lng } = point;
  const centerLat = circle.center?.lat || circle.latitude;
  const centerLng = circle.center?.lng || circle.longitude;
  const radius = circle.radius; // in meters

  if (!centerLat || !centerLng || !radius) return false;

  // Haversine distance calculation
  const R = 6371000; // Earth radius in meters
  const dLat = (lat - centerLat) * Math.PI / 180;
  const dLng = (lng - centerLng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(centerLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radius;
}

/**
 * Check if a point is inside a geofence
 * @private
 */
function isPointInGeofence(point, geofence) {
  if (!point || !geofence) return false;

  const lat = Number(point.latitude);
  const lng = Number(point.longitude);

  if (isNaN(lat) || isNaN(lng)) return false;

  const pointCoords = { lat, lng };

  if (geofence.type === 'circle' || geofence.radius) {
    return isPointInCircle(pointCoords, geofence);
  } else if (geofence.type === 'polygon' || geofence.coordinates) {
    return isPointInPolygon(pointCoords, geofence);
  }

  return false;
}

/**
 * Detect geofence entry/exit events from analytics data
 * 
 * @param {Array} analyticsData - Analytics data points with lat/lng
 * @param {Array} geofences - Array of geofence definitions
 * @returns {Array} Array of entry/exit events
 */
export function detectGeofenceEvents(analyticsData, geofences) {
  if (!analyticsData || analyticsData.length === 0 || !geofences || geofences.length === 0) {
    return [];
  }

  // Sort analytics by timestamp
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp).getTime();
    return timeA - timeB;
  });

  const events = [];
  const previousStates = {}; // Track previous state for each geofence

  sortedData.forEach((point, index) => {
    geofences.forEach(geofence => {
      const isInside = isPointInGeofence(point, geofence);
      const wasInside = previousStates[geofence.id];

      if (isInside && !wasInside) {
        // Entry event
        events.push({
          id: `${geofence.id}_entry_${index}`,
          type: 'entry',
          geofence: {
            id: geofence.id,
            name: geofence.name || `Geofence ${geofence.id}`,
            type: geofence.type
          },
          point: {
            latitude: point.latitude,
            longitude: point.longitude,
            speed: point.speed,
            imei: point.imei
          },
          timestamp: new Date(point.deviceTimestamp || point.timestamp),
          deviceImei: point.imei
        });
      } else if (!isInside && wasInside) {
        // Exit event
        events.push({
          id: `${geofence.id}_exit_${index}`,
          type: 'exit',
          geofence: {
            id: geofence.id,
            name: geofence.name || `Geofence ${geofence.id}`,
            type: geofence.type
          },
          point: {
            latitude: point.latitude,
            longitude: point.longitude,
            speed: point.speed,
            imei: point.imei
          },
          timestamp: new Date(point.deviceTimestamp || point.timestamp),
          deviceImei: point.imei
        });
      }

      previousStates[geofence.id] = isInside;
    });
  });

  return events;
}

/**
 * Calculate time spent in a geofence zone
 * 
 * @param {Array} analyticsData - Analytics data points
 * @param {Object} geofence - Geofence definition
 * @returns {Object} Time statistics
 */
export function calculateTimeInZone(analyticsData, geofence) {
  if (!analyticsData || analyticsData.length === 0 || !geofence) {
    return {
      totalTime: 0,
      visits: 0,
      avgTimePerVisit: 0,
      longestVisit: 0,
      shortestVisit: 0
    };
  }

  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp).getTime();
    return timeA - timeB;
  });

  let totalTime = 0;
  let visits = 0;
  let currentVisitStart = null;
  const visitDurations = [];

  sortedData.forEach((point, index) => {
    const isInside = isPointInGeofence(point, geofence);
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);

    if (isInside && !currentVisitStart) {
      // Start of visit
      currentVisitStart = timestamp;
    } else if (!isInside && currentVisitStart) {
      // End of visit
      const duration = (timestamp - currentVisitStart) / 1000; // seconds
      totalTime += duration;
      visitDurations.push(duration);
      visits++;
      currentVisitStart = null;
    }
  });

  // If still inside at the end
  if (currentVisitStart) {
    const lastPoint = sortedData[sortedData.length - 1];
    const duration = (new Date(lastPoint.deviceTimestamp || lastPoint.timestamp) - currentVisitStart) / 1000;
    totalTime += duration;
    visitDurations.push(duration);
    visits++;
  }

  return {
    totalTime: Math.round(totalTime),
    visits,
    avgTimePerVisit: visits > 0 ? Math.round(totalTime / visits) : 0,
    longestVisit: visitDurations.length > 0 ? Math.round(Math.max(...visitDurations)) : 0,
    shortestVisit: visitDurations.length > 0 ? Math.round(Math.min(...visitDurations)) : 0
  };
}

/**
 * Get geofence violations (unauthorized entries or exits)
 * 
 * @param {Array} events - Geofence events
 * @param {Object} rules - Violation rules
 * @returns {Array} Array of violations
 */
export function getGeofenceViolations(events, rules = {}) {
  if (!events || events.length === 0) return [];

  const violations = [];

  events.forEach(event => {
    // Check for unauthorized entry
    if (event.type === 'entry' && rules.restrictedZones?.includes(event.geofence.id)) {
      violations.push({
        ...event,
        violationType: 'unauthorized_entry',
        severity: 'high',
        message: `Unauthorized entry into ${event.geofence.name}`
      });
    }

    // Check for unauthorized exit
    if (event.type === 'exit' && rules.requiredZones?.includes(event.geofence.id)) {
      violations.push({
        ...event,
        violationType: 'unauthorized_exit',
        severity: 'medium',
        message: `Unauthorized exit from ${event.geofence.name}`
      });
    }

    // Check for speed violations inside geofence
    if (event.point.speed && rules.speedLimits?.[event.geofence.id]) {
      const speedLimit = rules.speedLimits[event.geofence.id];
      if (event.point.speed > speedLimit) {
        violations.push({
          ...event,
          violationType: 'speed_violation',
          severity: 'medium',
          message: `Speed ${event.point.speed} km/h exceeds limit of ${speedLimit} km/h in ${event.geofence.name}`
        });
      }
    }
  });

  return violations;
}

/**
 * Get most visited geofence zones
 * 
 * @param {Array} events - Geofence events
 * @returns {Array} Sorted array of zones by visit count
 */
export function getMostVisitedZones(events) {
  if (!events || events.length === 0) return [];

  const visitCounts = {};

  events.forEach(event => {
    if (event.type === 'entry') {
      const zoneId = event.geofence.id;
      if (!visitCounts[zoneId]) {
        visitCounts[zoneId] = {
          geofence: event.geofence,
          visits: 0,
          lastVisit: event.timestamp
        };
      }
      visitCounts[zoneId].visits++;
      if (event.timestamp > visitCounts[zoneId].lastVisit) {
        visitCounts[zoneId].lastVisit = event.timestamp;
      }
    }
  });

  return Object.values(visitCounts)
    .sort((a, b) => b.visits - a.visits);
}

/**
 * Calculate route efficiency between geofences
 * 
 * @param {Array} analyticsData - Analytics data points
 * @param {Array} geofences - Array of geofence definitions
 * @returns {Object} Route efficiency metrics
 */
export function calculateRouteEfficiency(analyticsData, geofences) {
  if (!analyticsData || analyticsData.length === 0 || !geofences || geofences.length === 0) {
    return {
      totalDistance: 0,
      insideGeofenceDistance: 0,
      outsideGeofenceDistance: 0,
      efficiency: 0
    };
  }

  let totalDistance = 0;
  let insideGeofenceDistance = 0;

  for (let i = 1; i < analyticsData.length; i++) {
    const prev = analyticsData[i - 1];
    const curr = analyticsData[i];

    // Calculate segment distance (simplified)
    const latDiff = Math.abs(curr.latitude - prev.latitude);
    const lngDiff = Math.abs(curr.longitude - prev.longitude);
    const segmentDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km

    totalDistance += segmentDistance;

    // Check if current point is inside any geofence
    const isInsideAnyGeofence = geofences.some(geofence => 
      isPointInGeofence(curr, geofence)
    );

    if (isInsideAnyGeofence) {
      insideGeofenceDistance += segmentDistance;
    }
  }

  const outsideGeofenceDistance = totalDistance - insideGeofenceDistance;
  const efficiency = totalDistance > 0 
    ? Math.round((insideGeofenceDistance / totalDistance) * 100)
    : 0;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    insideGeofenceDistance: Math.round(insideGeofenceDistance * 100) / 100,
    outsideGeofenceDistance: Math.round(outsideGeofenceDistance * 100) / 100,
    efficiency
  };
}

/**
 * Get geofence statistics summary
 * 
 * @param {Array} events - Geofence events
 * @param {Array} geofences - Array of geofence definitions
 * @returns {Object} Statistics summary
 */
export function getGeofenceStatistics(events, geofences) {
  if (!events || events.length === 0) {
    return {
      totalEvents: 0,
      totalEntries: 0,
      totalExits: 0,
      activeGeofences: 0,
      mostVisited: null,
      recentEvents: []
    };
  }

  const entries = events.filter(e => e.type === 'entry');
  const exits = events.filter(e => e.type === 'exit');
  const mostVisited = getMostVisitedZones(events);
  const recentEvents = events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const activeGeofenceIds = new Set(events.map(e => e.geofence.id));

  return {
    totalEvents: events.length,
    totalEntries: entries.length,
    totalExits: exits.length,
    activeGeofences: activeGeofenceIds.size,
    mostVisited: mostVisited[0] || null,
    recentEvents
  };
}

/**
 * Format duration in seconds to human-readable string
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0m';
}

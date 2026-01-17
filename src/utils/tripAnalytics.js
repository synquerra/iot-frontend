// src/utils/tripAnalytics.js
import haversine from './haversine';

/**
 * Configuration constants for trip detection
 */
const TRIP_CONFIG = {
  IDLE_THRESHOLD: 5, // km/h - speed below this is considered idle
  TIME_GAP_THRESHOLD: 300, // seconds - 5 minutes gap indicates trip end
  MIN_TRIP_POINTS: 3, // minimum points to consider a valid trip
  MIN_TRIP_DISTANCE: 0.1, // km - minimum distance for a valid trip
};

/**
 * Detect individual trips from analytics data
 * A trip is defined as continuous movement above idle threshold
 * 
 * @param {Array} analyticsData - Array of analytics points with speed, timestamp, lat, lng
 * @returns {Array} Array of detected trips
 */
export function detectTrips(analyticsData) {
  if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
    return [];
  }

  // Sort by timestamp to ensure chronological order
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp).getTime();
    return timeA - timeB;
  });

  const trips = [];
  let currentTrip = null;

  for (const point of sortedData) {
    const speed = Number(point.speed || 0);
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);

    // Check if point has valid coordinates
    const hasValidCoords = 
      point.latitude && point.longitude &&
      !isNaN(point.latitude) && !isNaN(point.longitude) &&
      Math.abs(point.latitude) > 0.0001 && Math.abs(point.longitude) > 0.0001;

    if (!hasValidCoords) {
      continue; // Skip invalid points
    }

    // Moving: speed above idle threshold
    if (speed > TRIP_CONFIG.IDLE_THRESHOLD) {
      if (!currentTrip) {
        // Start new trip
        currentTrip = {
          id: `trip_${timestamp.getTime()}`,
          deviceImei: point.imei,
          startTime: timestamp,
          startLocation: {
            lat: Number(point.latitude),
            lng: Number(point.longitude)
          },
          points: [point]
        };
      } else {
        // Check time gap from last point
        const lastPoint = currentTrip.points[currentTrip.points.length - 1];
        const lastTimestamp = new Date(lastPoint.deviceTimestamp || lastPoint.timestamp);
        const timeDiff = (timestamp - lastTimestamp) / 1000; // seconds

        if (timeDiff > TRIP_CONFIG.TIME_GAP_THRESHOLD) {
          // Time gap too large, finalize current trip and start new one
          if (currentTrip.points.length >= TRIP_CONFIG.MIN_TRIP_POINTS) {
            trips.push(finalizeTrip(currentTrip));
          }
          currentTrip = {
            id: `trip_${timestamp.getTime()}`,
            deviceImei: point.imei,
            startTime: timestamp,
            startLocation: {
              lat: Number(point.latitude),
              lng: Number(point.longitude)
            },
            points: [point]
          };
        } else {
          // Continue current trip
          currentTrip.points.push(point);
        }
      }
    } else if (currentTrip && currentTrip.points.length >= TRIP_CONFIG.MIN_TRIP_POINTS) {
      // Stopped moving, finalize trip
      currentTrip.endTime = new Date(
        currentTrip.points[currentTrip.points.length - 1].deviceTimestamp ||
        currentTrip.points[currentTrip.points.length - 1].timestamp
      );
      currentTrip.endLocation = {
        lat: Number(currentTrip.points[currentTrip.points.length - 1].latitude),
        lng: Number(currentTrip.points[currentTrip.points.length - 1].longitude)
      };
      trips.push(finalizeTrip(currentTrip));
      currentTrip = null;
    }
  }

  // Finalize any remaining trip
  if (currentTrip && currentTrip.points.length >= TRIP_CONFIG.MIN_TRIP_POINTS) {
    trips.push(finalizeTrip(currentTrip));
  }

  // Filter out trips with insufficient distance
  return trips.filter(trip => trip.distance >= TRIP_CONFIG.MIN_TRIP_DISTANCE);
}

/**
 * Finalize a trip by calculating all metrics
 * @private
 */
function finalizeTrip(trip) {
  const lastPoint = trip.points[trip.points.length - 1];
  
  return {
    ...trip,
    endTime: trip.endTime || new Date(lastPoint.deviceTimestamp || lastPoint.timestamp),
    endLocation: trip.endLocation || {
      lat: Number(lastPoint.latitude),
      lng: Number(lastPoint.longitude)
    },
    distance: calculateTripDistance(trip.points),
    duration: calculateTripDuration(trip),
    avgSpeed: calculateAverageSpeed(trip.points),
    maxSpeed: calculateMaxSpeed(trip.points)
  };
}

/**
 * Calculate total distance of a trip using Haversine formula
 * 
 * @param {Array} tripPoints - Array of trip points with lat/lng
 * @returns {number} Total distance in kilometers
 */
export function calculateTripDistance(tripPoints) {
  if (!Array.isArray(tripPoints) || tripPoints.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 1; i < tripPoints.length; i++) {
    const prev = tripPoints[i - 1];
    const curr = tripPoints[i];

    const lat1 = Number(prev.latitude);
    const lon1 = Number(prev.longitude);
    const lat2 = Number(curr.latitude);
    const lon2 = Number(curr.longitude);

    // Skip if any coordinate is invalid
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      continue;
    }

    const segmentDistance = haversine(lat1, lon1, lat2, lon2);
    totalDistance += segmentDistance;
  }

  return totalDistance;
}

/**
 * Calculate trip duration in seconds
 * 
 * @param {Object} trip - Trip object with startTime and endTime or points
 * @returns {number} Duration in seconds
 */
export function calculateTripDuration(trip) {
  if (!trip) return 0;

  let startTime, endTime;

  if (trip.startTime && trip.endTime) {
    startTime = new Date(trip.startTime);
    endTime = new Date(trip.endTime);
  } else if (trip.points && trip.points.length >= 2) {
    const firstPoint = trip.points[0];
    const lastPoint = trip.points[trip.points.length - 1];
    startTime = new Date(firstPoint.deviceTimestamp || firstPoint.timestamp);
    endTime = new Date(lastPoint.deviceTimestamp || lastPoint.timestamp);
  } else {
    return 0;
  }

  const durationMs = endTime - startTime;
  return Math.max(0, Math.floor(durationMs / 1000)); // seconds
}

/**
 * Calculate average speed for trip points
 * @private
 */
function calculateAverageSpeed(tripPoints) {
  if (!Array.isArray(tripPoints) || tripPoints.length === 0) {
    return 0;
  }

  const speeds = tripPoints
    .map(p => Number(p.speed || 0))
    .filter(s => s > 0);

  if (speeds.length === 0) return 0;

  const sum = speeds.reduce((acc, speed) => acc + speed, 0);
  return sum / speeds.length;
}

/**
 * Calculate maximum speed for trip points
 * @private
 */
function calculateMaxSpeed(tripPoints) {
  if (!Array.isArray(tripPoints) || tripPoints.length === 0) {
    return 0;
  }

  return Math.max(...tripPoints.map(p => Number(p.speed || 0)));
}

/**
 * Estimate fuel consumption based on distance and average speed
 * Uses simplified fuel consumption model
 * 
 * @param {number} distance - Distance in kilometers
 * @param {number} avgSpeed - Average speed in km/h
 * @returns {number} Estimated fuel consumption in liters
 */
export function estimateFuelConsumption(distance, avgSpeed) {
  if (!distance || distance <= 0) return 0;
  if (!avgSpeed || avgSpeed <= 0) return 0;

  // Simplified fuel consumption model
  // Base consumption: 8 L/100km at optimal speed (60 km/h)
  const baseConsumption = 8; // L/100km
  const optimalSpeed = 60; // km/h

  // Efficiency factor based on speed deviation from optimal
  // Fuel consumption increases at very low and very high speeds
  let efficiencyFactor = 1.0;
  
  if (avgSpeed < 40) {
    // City driving - higher consumption
    efficiencyFactor = 1.3;
  } else if (avgSpeed > 100) {
    // High-speed driving - higher consumption
    efficiencyFactor = 1.2 + ((avgSpeed - 100) * 0.01);
  } else if (avgSpeed >= 50 && avgSpeed <= 70) {
    // Optimal range - best efficiency
    efficiencyFactor = 0.9;
  }

  const fuelPer100km = baseConsumption * efficiencyFactor;
  const estimatedFuel = (distance / 100) * fuelPer100km;

  return Math.round(estimatedFuel * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate idle time vs moving time from analytics data
 * 
 * @param {Array} analyticsData - Array of analytics points
 * @returns {Object} Object with idleTime and movingTime in seconds
 */
export function calculateIdleTime(analyticsData) {
  if (!Array.isArray(analyticsData) || analyticsData.length < 2) {
    return { idleTime: 0, movingTime: 0, totalTime: 0 };
  }

  // Sort by timestamp
  const sortedData = [...analyticsData].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp).getTime();
    return timeA - timeB;
  });

  let idleTime = 0;
  let movingTime = 0;

  for (let i = 1; i < sortedData.length; i++) {
    const prev = sortedData[i - 1];
    const curr = sortedData[i];

    const prevTime = new Date(prev.deviceTimestamp || prev.timestamp);
    const currTime = new Date(curr.deviceTimestamp || curr.timestamp);
    const timeDiff = (currTime - prevTime) / 1000; // seconds

    // Skip unreasonably large gaps (more than 1 hour)
    if (timeDiff > 3600) continue;

    const speed = Number(curr.speed || 0);

    if (speed <= TRIP_CONFIG.IDLE_THRESHOLD) {
      idleTime += timeDiff;
    } else {
      movingTime += timeDiff;
    }
  }

  const totalTime = idleTime + movingTime;

  return {
    idleTime: Math.round(idleTime),
    movingTime: Math.round(movingTime),
    totalTime: Math.round(totalTime),
    idlePercentage: totalTime > 0 ? Math.round((idleTime / totalTime) * 100) : 0,
    movingPercentage: totalTime > 0 ? Math.round((movingTime / totalTime) * 100) : 0
  };
}

/**
 * Get aggregate statistics for multiple trips
 * 
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Aggregate statistics
 */
export function getTripStatistics(trips) {
  if (!Array.isArray(trips) || trips.length === 0) {
    return {
      totalTrips: 0,
      totalDistance: 0,
      totalDuration: 0,
      avgDistance: 0,
      avgDuration: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      totalFuel: 0
    };
  }

  const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
  const totalDuration = trips.reduce((sum, trip) => sum + (trip.duration || 0), 0);
  const speeds = trips.map(trip => trip.avgSpeed || 0).filter(s => s > 0);
  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b) / speeds.length : 0;
  const maxSpeed = Math.max(...trips.map(trip => trip.maxSpeed || 0));
  const totalFuel = trips.reduce((sum, trip) => {
    return sum + estimateFuelConsumption(trip.distance, trip.avgSpeed);
  }, 0);

  return {
    totalTrips: trips.length,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round(totalDuration),
    avgDistance: Math.round((totalDistance / trips.length) * 100) / 100,
    avgDuration: Math.round(totalDuration / trips.length),
    avgSpeed: Math.round(avgSpeed * 100) / 100,
    maxSpeed: Math.round(maxSpeed * 100) / 100,
    totalFuel: Math.round(totalFuel * 100) / 100
  };
}

/**
 * Format duration in seconds to human-readable string
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 30m")
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

/**
 * Format distance to human-readable string
 * 
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance
 */
export function formatDistance(km) {
  if (!km || km <= 0) return '0 km';

  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }

  return `${Math.round(km * 100) / 100} km`;
}

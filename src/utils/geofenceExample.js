/**
 * Geofence Command Usage Example
 * 
 * This file demonstrates how to use the SET_GEOFENCE command
 * with the deviceCommandAPI to set geographic boundaries for devices.
 */

import { sendDeviceCommand } from './deviceCommandAPI.js';

/**
 * Example: Set a geofence for a device
 * 
 * This example shows how to create a geofence with multiple coordinates
 * forming a closed polygon around a specific area.
 */
export async function setGeofenceExample() {
  try {
    const result = await sendDeviceCommand(
      '862942074957887', // IMEI
      'SET_GEOFENCE',    // Command
      {
        geofence_number: 'GEO1',
        geofence_id: 'Home',
        coordinates: [
          { latitude: 23.301624, longitude: 85.327065 },
          { latitude: 23.301700, longitude: 85.327100 },
          { latitude: 23.301750, longitude: 85.327150 },
          { latitude: 23.301700, longitude: 85.327200 },
          { latitude: 23.301624, longitude: 85.327065 } // Closes the polygon
        ]
      }
    );

    console.log('Geofence set successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to set geofence:', error.message);
    throw error;
  }
}

/**
 * Example: Set a simple rectangular geofence
 */
export async function setRectangularGeofence(imei, geofenceId, topLeft, bottomRight) {
  const coordinates = [
    { latitude: topLeft.lat, longitude: topLeft.lng },
    { latitude: topLeft.lat, longitude: bottomRight.lng },
    { latitude: bottomRight.lat, longitude: bottomRight.lng },
    { latitude: bottomRight.lat, longitude: topLeft.lng },
    { latitude: topLeft.lat, longitude: topLeft.lng } // Close the polygon
  ];

  return await sendDeviceCommand(imei, 'SET_GEOFENCE', {
    geofence_number: 'GEO1',
    geofence_id: geofenceId,
    coordinates
  });
}

/**
 * Example: Set a circular geofence (approximated with polygon)
 * 
 * @param {string} imei - Device IMEI
 * @param {string} geofenceId - Geofence identifier
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @param {number} numPoints - Number of points to approximate circle (default: 16)
 */
export async function setCircularGeofence(
  imei,
  geofenceId,
  centerLat,
  centerLng,
  radiusMeters,
  numPoints = 16
) {
  // Convert radius from meters to degrees (approximate)
  const radiusLat = radiusMeters / 111320; // 1 degree latitude ≈ 111.32 km
  const radiusLng = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));

  // Generate points around the circle
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = centerLat + radiusLat * Math.sin(angle);
    const lng = centerLng + radiusLng * Math.cos(angle);
    coordinates.push({ latitude: lat, longitude: lng });
  }

  return await sendDeviceCommand(imei, 'SET_GEOFENCE', {
    geofence_number: 'GEO1',
    geofence_id: geofenceId,
    coordinates
  });
}

/**
 * Example: Set geofence from UI form data
 */
export async function setGeofenceFromForm(formData) {
  const { imei, geofenceName, coordinates } = formData;

  // Ensure the polygon is closed
  const coordArray = [...coordinates];
  const first = coordArray[0];
  const last = coordArray[coordArray.length - 1];

  // Add closing point if not already closed
  if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
    coordArray.push({ ...first });
  }

  return await sendDeviceCommand(imei, 'SET_GEOFENCE', {
    geofence_number: 'GEO1',
    geofence_id: geofenceName,
    coordinates: coordArray
  });
}

// Example usage in your application:
// 
// import { setGeofenceExample, setCircularGeofence } from './utils/geofenceExample.js';
// 
// // Set a custom geofence
// await setGeofenceExample();
// 
// // Set a circular geofence around a location
// await setCircularGeofence(
//   '862942074957887',
//   'Office',
//   23.301624,
//   85.327065,
//   100 // 100 meters radius
// );

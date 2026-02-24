// src/utils/device.js
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL;

/**
 * Validate and normalize telemetry values (battery level, signal strength)
 * Ensures values are within 0-100 range or returns null for invalid/missing data
 */
function validateTelemetryValue(value) {
  // Handle null, undefined, or non-numeric values
  if (value === null || value === undefined || typeof value !== 'number') {
    return null;
  }
  
  // Handle invalid numeric ranges
  if (value < 0 || value > 100 || !Number.isFinite(value)) {
    return null;
  }
  
  // Return valid value
  return Math.round(value); // Ensure integer percentage
}

/**
 * Fetch devices (client-side pagination)
 * Returns:
 * { devices: [...], total: number, full: [...] }
 */
export async function listDevices(page = 1, limit = 20) {
  // Use basic query without batteryLevel/signalStrength (not supported by backend yet)
  let query = `
    { devices { topic imei interval geoid createdAt studentName studentId } }
  `;

  const res = await fetch(`${API_BASE_URL}/device/device-master-query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (!json || json.status !== "success") {
    throw new Error(json?.error_description || "Failed to fetch devices");
  }

  // FIX: GraphQL returns { data: { devices: [...] } }
  const arr = Array.isArray(json.data.devices) ? json.data.devices : [];

  // Debug: Log first device to see what fields are available
  if (arr.length > 0) {
    console.log('🔍 API Response - First Device:', {
      imei: arr[0].imei,
      studentName: arr[0].studentName,
      studentId: arr[0].studentId,
      topic: arr[0].topic,
      allFields: Object.keys(arr[0])
    });
  }

  // Process devices to handle new fields with proper fallbacks
  const processedDevices = arr.map(device => ({
    ...device,
    // Ensure student fields are properly handled
    studentName: device.studentName || null,
    studentId: device.studentId || null,
    // Set null for unsupported telemetry fields
    batteryLevel: null,
    signalStrength: null
  }));

  const total = processedDevices.length;
  const start = (page - 1) * limit;
  const paged = processedDevices.slice(start, start + limit);

  return { devices: paged, total, full: processedDevices };
}

/**
 * Fetch device by topic (single)
 */
export async function getDeviceByTopic(topic) {
  // Use basic query without batteryLevel/signalStrength (not supported by backend yet)
  let query = `
    { deviceByTopic(topic: "${topic}") { topic imei interval geoid createdAt studentName studentId } }
  `;

  const res = await fetch(`${API_BASE_URL}/device/device-master-query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (!json || json.status !== "success") {
    throw new Error(json?.error_description || "Failed to fetch device");
  }

  const device = json.data.deviceByTopic;
  
  // Process device to set null for unsupported telemetry fields
  if (device) {
    return {
      ...device,
      studentName: device.studentName || null,
      studentId: device.studentId || null,
      batteryLevel: null,
      signalStrength: null
    };
  }

  return device;
}



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
  // Try enhanced query first, fallback to basic query if new fields not supported
  let query = `
    { devices { topic imei interval geoid createdAt batteryLevel signalStrength } }
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

  // Check if the enhanced query failed due to unsupported fields
  if (!json || json.status !== "success") {
    // Check if error is related to unknown fields
    const errorMsg = json?.error_description || "";
    if (errorMsg.includes("batteryLevel") || errorMsg.includes("signalStrength")) {
      console.warn("Backend doesn't support batteryLevel/signalStrength fields yet. Using fallback query.");
      
      // Fallback to original query without new fields
      const fallbackQuery = `
        { devices { topic imei interval geoid createdAt } }
      `;
      
      const fallbackRes = await fetch(`${API_BASE_URL}/device/device-master-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: fallbackQuery }),
      });

      const fallbackJson = await fallbackRes.json();
      
      if (!fallbackJson || fallbackJson.status !== "success") {
        throw new Error(fallbackJson?.error_description || "Failed to fetch devices");
      }

      // Process fallback response
      const arr = Array.isArray(fallbackJson.data.devices) ? fallbackJson.data.devices : [];
      const processedDevices = arr.map(device => ({
        ...device,
        // Set null values for unsupported fields
        batteryLevel: null,
        signalStrength: null
      }));

      const total = processedDevices.length;
      const start = (page - 1) * limit;
      const paged = processedDevices.slice(start, start + limit);

      return { devices: paged, total, full: processedDevices };
    }
    
    // If it's a different error, throw it
    throw new Error(json?.error_description || "Failed to fetch devices");
  }

  // FIX: GraphQL returns { data: { devices: [...] } }
  const arr = Array.isArray(json.data.devices) ? json.data.devices : [];

  // Process devices to handle new fields with proper fallbacks
  const processedDevices = arr.map(device => ({
    ...device,
    // Ensure batteryLevel and signalStrength are properly handled
    batteryLevel: validateTelemetryValue(device.batteryLevel),
    signalStrength: validateTelemetryValue(device.signalStrength)
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
  // Try enhanced query first, fallback to basic query if new fields not supported
  let query = `
    { deviceByTopic(topic: "${topic}") { topic imei interval geoid createdAt batteryLevel signalStrength } }
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

  // Check if the enhanced query failed due to unsupported fields
  if (!json || json.status !== "success") {
    // Check if error is related to unknown fields
    const errorMsg = json?.error_description || "";
    if (errorMsg.includes("batteryLevel") || errorMsg.includes("signalStrength")) {
      console.warn("Backend doesn't support batteryLevel/signalStrength fields yet. Using fallback query.");
      
      // Fallback to original query without new fields
      const fallbackQuery = `
        { deviceByTopic(topic: "${topic}") { topic imei interval geoid createdAt } }
      `;
      
      const fallbackRes = await fetch(`${API_BASE_URL}/device/device-master-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: fallbackQuery }),
      });

      const fallbackJson = await fallbackRes.json();
      
      if (!fallbackJson || fallbackJson.status !== "success") {
        throw new Error(fallbackJson?.error_description || "Failed to fetch device");
      }

      const device = fallbackJson.data.deviceByTopic;
      
      // Process device to add null values for unsupported fields
      if (device) {
        return {
          ...device,
          batteryLevel: null,
          signalStrength: null
        };
      }

      return device;
    }
    
    // If it's a different error, throw it
    throw new Error(json?.error_description || "Failed to fetch device");
  }

  const device = json.data.deviceByTopic;
  
  // Process device to handle new fields with proper fallbacks
  if (device) {
    return {
      ...device,
      batteryLevel: validateTelemetryValue(device.batteryLevel),
      signalStrength: validateTelemetryValue(device.signalStrength)
    };
  }

  return device;
}



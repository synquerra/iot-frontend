// src/utils/device.js
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || "http://127.0.0.1:8020";

/**
 * Fetch devices (client-side pagination)
 * Returns:
 * { devices: [...], total: number, full: [...] }
 */
export async function listDevices(page = 1, limit = 20) {
  const query = `
    { devices { topic imei interval geoid createdAt } }
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

  const total = arr.length;
  const start = (page - 1) * limit;
  const paged = arr.slice(start, start + limit);

  return { devices: paged, total, full: arr };
}

/**
 * Fetch device by topic (single)
 */
export async function getDeviceByTopic(topic) {
  const query = `
    { deviceByTopic(topic: "${topic}") { topic imei interval geoid createdAt } }
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

  return json.data.deviceByTopic;
}



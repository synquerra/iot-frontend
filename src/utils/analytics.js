const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || "http://127.0.0.1:8020";

/* ---------------------------------------------------------
   Send GraphQL Query (POST)
--------------------------------------------------------- */
async function sendQuery(queryString) {
  if (!queryString || !queryString.trim()) {
    throw new Error("Missing GraphQL query");
  }

  const res = await fetch(`${API_BASE_URL}/analytics/analytics-query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ query: queryString }),
  });

  const json = await res.json();

  if (json?.errors) {
    console.error(json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL Error");
  }

  return json.data;
}

/* ---------------------------------------------------------
   TIMESTAMP EXTRACTOR
   PRIORITY:
   1) deviceTimestamp  (naive IST datetime from backend)
   2) timestamp        (fallback)
   3) deviceRawTimestamp (string from device)
--------------------------------------------------------- */
export function extractTimestamp(p) {
  if (!p) return null;

  const ts =
    p.deviceTimestamp ??
    p.timestamp ??
    p.deviceRawTimestamp ??
    null;

  if (!ts) return null;

  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------------------------------------------------------
   SORT newest → oldest
--------------------------------------------------------- */
function sortPackets(arr) {
  if (!Array.isArray(arr)) return [];

  return [...arr].sort((a, b) => {
    const ta = extractTimestamp(a)?.getTime() || 0;
    const tb = extractTimestamp(b)?.getTime() || 0;
    return tb - ta;
  });
}

/* ---------------------------------------------------------
   NORMALIZE PACKETS
--------------------------------------------------------- */
function normalize(list) {
  if (!Array.isArray(list)) return [];

  return list.map((p) => ({
    ...p,
    __timestamp: extractTimestamp(p),
  }));
}

/* ---------------------------------------------------------
   1. Get ALL analytics
--------------------------------------------------------- */
export async function getAllAnalytics() {
  const q = `
  {
    analyticsData {
      id
      topic
      imei
      interval
      geoid
      packet
      latitude
      longitude
      speed
      battery
      signal
      alert
      type

      timestamp
      deviceTimestamp
      deviceRawTimestamp

      rawPacket
      rawImei
      rawAlert
      rawTemperature
    }
  }`;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsData || []);
  return sortPackets(cleaned);
}

/* ---------------------------------------------------------
   2. Paginated
--------------------------------------------------------- */
export async function getAnalyticsPaginated(skip = 0, limit = 10) {
  const q = `
  {
    analyticsDataPaginated(skip: ${skip}, limit: ${limit}) {
      id
      topic
      imei
      packet
      latitude
      longitude
      speed
      battery
      alert
      type

      timestamp
      deviceTimestamp
      deviceRawTimestamp
      rawTemperature
    }
  }`;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataPaginated || []);
  return sortPackets(cleaned);
}

/* ---------------------------------------------------------
   3. Get by ID
--------------------------------------------------------- */
export async function getAnalyticsById(id) {
  const q = `
  {
    analyticsDataById(id: "${id}") {
      id
      topic
      imei
      latitude
      longitude
      speed
      battery
      signal
      alert
      type

      timestamp
      deviceTimestamp
      deviceRawTimestamp

      rawPacket
      rawImei
      rawAlert
      rawTemperature
    }
  }`;

  const result = await sendQuery(q);
  return {
    ...result.analyticsDataById,
    __timestamp: extractTimestamp(result.analyticsDataById),
  };
}

/* ---------------------------------------------------------
   4. Get by TOPIC
--------------------------------------------------------- */
export async function getAnalyticsByTopic(topic) {
  const q = `
  {
    analyticsDataByTopic(topic: "${topic}") {
      id
      topic
      imei
      packet
      latitude
      longitude
      speed
      battery
      signal
      alert
      type

      timestamp
      deviceTimestamp
      deviceRawTimestamp

      rawPacket
      rawImei
      rawAlert
      rawTemperature
    }
  }`;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataByTopic || []);
  return sortPackets(cleaned);
}

/* ---------------------------------------------------------
   5. Count
--------------------------------------------------------- */
export async function getAnalyticsCount() {
  const q = `{ analyticsDataCount }`;

  const result = await sendQuery(q);
  return result.analyticsDataCount || 0;
}

/* ---------------------------------------------------------
   6. Get by IMEI (FULL CLEAN)
--------------------------------------------------------- */
export async function getAnalyticsByImei(imei) {
  const q = `
  {
    analyticsDataByImei(imei: "${imei}") {
      id
      topic
      imei
      interval
      geoid
      packet
      latitude
      longitude
      speed
      battery
      signal
      alert
      type

      timestamp
      deviceTimestamp
      deviceRawTimestamp

      rawPacket
      rawImei
      rawAlert
      rawTemperature
    }
  }`;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataByImei || []);
  return sortPackets(cleaned);
}
/* ---------------------------------------------------------
   7. DEVICE HEALTH (New)
--------------------------------------------------------- */

export async function getAnalyticsHealth(imei) {
  const q = `
  {
    analyticsHealth(imei: "${imei}") {
      gpsScore
      movement
      movementStats
      temperatureHealthIndex
      temperatureStatus
    }
  }
  `;
  const result = await sendQuery(q);
  return result.analyticsHealth;
}

export async function getAnalyticsUptime(imei) {
  const q = `
  {
    analyticsUptime(imei: "${imei}") {
      score
      expectedPackets
      receivedPackets
      largestGapSec
      dropouts
    }
  }
  `;
  const result = await sendQuery(q);
  return result.analyticsUptime;
}


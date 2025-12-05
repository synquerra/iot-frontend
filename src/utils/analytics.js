// src/utils/analytics.js

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
   MASTER TIMESTAMP EXTRACTOR
   Always use deviceTimestamp as the REAL timestamp.
--------------------------------------------------------- */
export function extractTimestamp(p) {
  if (!p) return null;

  const ts =
    p.deviceTimestamp ??
    p.device_timestamp ??
    p.timestamp ??
    p.rawTimestamp ??
    null;

  if (!ts) return null;

  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------------------------------------------------------
   Correct Sort: newest → oldest using ONLY device timestamp
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
   Clean Response: normalize timestamps to Date objects
--------------------------------------------------------- */
function normalize(resultArray) {
  if (!Array.isArray(resultArray)) return [];

  return resultArray.map((p) => ({
    ...p,
    __timestamp: extractTimestamp(p), // internal Date object
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
        alert
        latitude
        longitude
        speed
        battery
        signal

        timestamp
        deviceTimestamp
        receivedAtUtc
        rawTimestamp

        rawPacket
        rawImei
        rawAlert
        rawTemperature
        rawSpeed
        rawSignal
        rawBattery
        rawGeoid
        rawLatitude
        rawLongitude
        rawInterval
        type
      }
    }
  `;

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
        latitude
        longitude
        speed
        battery
        alert

        timestamp
        deviceTimestamp
        rawTimestamp
      }
    }
  `;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataPaginated || []);
  return sortPackets(cleaned);
}

/* ---------------------------------------------------------
   3. Get Analytics by ID
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
        alert

        timestamp
        deviceTimestamp
        rawTimestamp
      }
    }
  `;

  const result = await sendQuery(q);
  return {
    ...result.analyticsDataById,
    __timestamp: extractTimestamp(result.analyticsDataById),
  };
}

/* ---------------------------------------------------------
   4. Get Analytics by Topic
--------------------------------------------------------- */
export async function getAnalyticsByTopic(topic) {
  const q = `
    {
      analyticsDataByTopic(topic: "${topic}") {
        id
        topic
        imei
        latitude
        longitude
        speed
        battery
        alert

        timestamp
        deviceTimestamp
        rawTimestamp
      }
    }
  `;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataByTopic || []);
  return sortPackets(cleaned);
}

/* ---------------------------------------------------------
   5. Count
--------------------------------------------------------- */
export async function getAnalyticsCount() {
  const q = `
    {
      analyticsDataCount
    }
  `;

  const result = await sendQuery(q);
  return result.analyticsDataCount || 0;
}

/* ---------------------------------------------------------
   6. Get Analytics by IMEI
--------------------------------------------------------- */
export async function getAnalyticsByImei(imei) {
  const q = `
    {
      analyticsDataByImei(imei: "${imei}") {
        id
        topic
        imei
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
        rawTimestamp
        receivedAtUtc

        rawPacket
        rawImei
        rawAlert
        rawTemperature
        rawSpeed
        rawSignal
        rawBattery
        rawGeoid
        rawLatitude
        rawLongitude
        rawInterval
      }
    }
  `;

  const result = await sendQuery(q);
  const cleaned = normalize(result.analyticsDataByImei || []);
  return sortPackets(cleaned);
}

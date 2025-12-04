// src/utils/analytics.js
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || "http://127.0.0.1:8020";

// helper: send GraphQL query and return parsed json.data
async function sendQuery(query) {
  const res = await fetch(`${API_BASE_URL}/analytics/analytics-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!json || json.status !== "success") {
    throw new Error(json?.error_description || "Analytics API error");
  }
  return json.data;
}

/* ---------------------------------------------------------
   TIMESTAMP PRIORITY
   1) timestampNormalized (has timezone)
   2) timestamp          (ISO or datetime)
   3) processedAt        (Z format)
--------------------------------------------------------- */
export function extractTimestamp(p) {
  if (!p) return null;

  return (
    p.timestampNormalized ||
    p.timestamp ||
    p.processedAt ||
    null
  );
}

/* ---------------------------------------------------------
   SORT newest → oldest
--------------------------------------------------------- */
function sortPackets(arr) {
  return arr.sort((a, b) => {
    const tb = new Date(extractTimestamp(b));
    const ta = new Date(extractTimestamp(a));
    return tb - ta;
  });
}

/* ---------------------------------------------------------
   1. Get ALL analytics
--------------------------------------------------------- */
export async function getAllAnalytics() {
  const query = `
    { analyticsData { 
        id topic imei interval geoid packet latitude longitude speed 
        battery signal alert rawText timestampNormalized  
        timestamp processedAt type 
    }}
  `;
  const data = await sendQuery(query);
  return sortPackets(data.analyticsData || []);
}

/* ---------------------------------------------------------
   2. Paginated
--------------------------------------------------------- */
export async function getAnalyticsPaginated(skip = 0, limit = 10) {
  const query = `
    { analyticsDataPaginated(skip: ${skip}, limit: ${limit}) { 
        id topic imei interval geoid packet latitude longitude speed 
        battery signal alert rawText timestampNormalized  
        timestamp processedAt type
    }}
  `;
  const data = await sendQuery(query);
  return sortPackets(data.analyticsDataPaginated || []);
}

/* ---------------------------------------------------------
   3. Get Analytics by ID
--------------------------------------------------------- */
export async function getAnalyticsById(id) {
  const query = `
    { analyticsDataById(id: "${id}") {
        id topic imei packet latitude longitude speed 
        timestampNormalized processedAt type timestamp
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsDataById || null;
}

/* ---------------------------------------------------------
   4. Get by Topic
--------------------------------------------------------- */
export async function getAnalyticsByTopic(topic) {
  const query = `
    { analyticsDataByTopic(topic: "${topic}") {
        id topic imei packet latitude longitude speed 
        timestampNormalized processedAt type timestamp
    }}
  `;
  const data = await sendQuery(query);
  return sortPackets(data.analyticsDataByTopic || []);
}

/* ---------------------------------------------------------
   5. Count
--------------------------------------------------------- */
export async function getAnalyticsCount() {
  const query = `{ analyticsDataCount }`;
  const data = await sendQuery(query);
  const c = data.analyticsDataCount;
  return typeof c === "number" ? c : Number(c) || 0;
}

/* ---------------------------------------------------------
   6. Get Analytics by IMEI (MAIN USED)
--------------------------------------------------------- */
export async function getAnalyticsByImei(imei) {
  const query = `
    { analyticsDataByImei(imei: "${imei}") {
        id topic imei interval geoid packet latitude longitude speed
        battery signal alert rawText timestampNormalized processedAt
        type timestamp
    }}
  `;

  const data = await sendQuery(query);
  const arr = data.analyticsDataByImei || [];

  return sortPackets(arr);
}

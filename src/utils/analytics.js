// src/utils/analytics.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || "http://127.0.0.1:8020";

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

// 1. Get ALL analytics data
export async function getAllAnalytics() {
  const query = `
    { analyticsData { 
        id topic imei interval geoid packet latitude longitude speed 
        battery signal alert rawText timestampNormalized timestampIso 
        timestamp receivedAtIst processedAt type createdAt 
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsData || [];
}

// 2. Get paginated analytics (server-side if supported)
export async function getAnalyticsPaginated(skip = 0, limit = 10) {
  const query = `
    { analyticsDataPaginated(skip: ${skip}, limit: ${limit}) { 
        id topic imei interval geoid packet latitude longitude speed 
        battery signal alert rawText timestampNormalized timestampIso 
        timestamp receivedAtIst processedAt type createdAt 
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsDataPaginated || [];
}

// 3. Get analytics by ID
export async function getAnalyticsById(id) {
  const query = `
    { analyticsDataById(id: "${id}") {
        id topic imei packet latitude longitude speed 
        timestampNormalized timestampIso processedAt type createdAt
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsDataById || null;
}

// 4. Get analytics by topic
export async function getAnalyticsByTopic(topic) {
  const query = `
    { analyticsDataByTopic(topic: "${topic}") {
        id topic imei packet latitude longitude speed 
        timestampNormalized timestampIso processedAt type createdAt
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsDataByTopic || [];
}

// 5. Get analytics by IMEI
export async function getAnalyticsByImei(imei) {
  const query = `
    { analyticsDataByImei(imei: "${imei}") {
        id topic imei packet latitude longitude speed 
        battery signal timestampNormalized timestampIso processedAt type createdAt
    }}
  `;
  const data = await sendQuery(query);
  return data.analyticsDataByImei || [];
}

// 6. Count
export async function getAnalyticsCount() {
  const query = `{ analyticsDataCount }`;
  const data = await sendQuery(query);
  // data.analyticsDataCount may be a number or object
  const c = data.analyticsDataCount;
  return typeof c === "number" ? c : Number(c) || 0;
}

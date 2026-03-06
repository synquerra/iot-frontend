import api from "@/lib/axios";

export type AnalyticsPacket = {
  id: string;
  topic: string;
  imei: string;
  interval?: number | string | null;
  geoid?: string | null;
  packet?: string | null;
  latitude: number;
  longitude: number;
  speed: number;
  battery: number;
  signal?: string | number | null;
  alert?: string | null;
  type?: string | null;
  timestamp?: string | null;
  deviceTimestamp?: string | null;
  deviceRawTimestamp?: string | null;
  rawPacket?: string | null;
  rawImei?: string | null;
  rawAlert?: string | null;
  rawTemperature?: string | null;
  rawPhone1?: string | null;
  rawPhone2?: string | null;
  rawControlPhone?: string | null;
  __timestamp?: Date | null;
};

export type AnalyticsHealth = {
  gpsScore?: number;
  movement?: string;
  movementStats?: string;
  temperatureHealthIndex?: number;
  temperatureStatus?: string;
};

export type AnalyticsUptime = {
  score?: number;
  expectedPackets?: number;
  receivedPackets?: number;
  largestGapSec?: number;
  dropouts?: number;
};

/* =========================================================
   ERROR CLASSES
========================================================= */

export class ApiError extends Error {
  statusCode: number | null;
  retryable: boolean;
  timestamp: string;

  constructor(
    message: string,
    statusCode: number | null = null,
    retryable = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends Error {
  field?: string;
  retryable: boolean = false;
  timestamp: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.timestamp = new Date().toISOString();
  }
}

/* =========================================================
   GRAPHQL WRAPPER (AXIOS)
========================================================= */

async function sendQuery(query: string) {
  if (!query?.trim()) {
    throw new ValidationError("Missing GraphQL query");
  }

  try {
    const response = await api.post(
      "/analytics/analytics-query",
      { query },
      { timeout: 30000 },
    );

    const json = response.data;

    if (json?.errors) {
      throw new ApiError(
        json.errors[0]?.message || "GraphQL Error",
        response.status,
        false,
      );
    }

    return json.data;
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status ===
        "number"
        ? ((error as { response?: { status?: number } }).response?.status ??
          null)
        : null;
    const message =
      error instanceof Error ? error.message : "Analytics request failed";
    throw new ApiError(message, statusCode, (statusCode ?? 0) >= 500);
  }
}

/* =========================================================
   TIMESTAMP HELPERS
========================================================= */

export function extractTimestamp(
  p: Partial<AnalyticsPacket> | null | undefined,
) {
  if (!p) return null;
  const ts = p.deviceTimestamp ?? p.timestamp ?? p.deviceRawTimestamp ?? null;

  if (!ts) return null;

  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

export function sortPackets(arr: AnalyticsPacket[]): AnalyticsPacket[] {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const ta = extractTimestamp(a)?.getTime() || 0;
    const tb = extractTimestamp(b)?.getTime() || 0;
    return tb - ta;
  });
}

export function normalize(list: AnalyticsPacket[]): AnalyticsPacket[] {
  if (!Array.isArray(list)) return [];
  return list.map((p) => ({
    ...p,
    __timestamp: extractTimestamp(p),
  }));
}

/* =========================================================
   VALIDATION
========================================================= */

function validateAnalyticsData(data: AnalyticsPacket[]): AnalyticsPacket[] {
  if (!Array.isArray(data)) {
    throw new ValidationError("Analytics data must be an array");
  }

  return data
    .filter((p) => p && p.id && p.imei)
    .map((p) => ({
      ...p,
      latitude: Number(p.latitude || 0),
      longitude: Number(p.longitude || 0),
      speed: Number(p.speed || 0),
      battery: Number(p.battery || 0),
    }));
}

/* =========================================================
   ANALYTICS METHODS
========================================================= */

export async function getAnalyticsByImei(imei: string) {
  if (!imei) {
    throw new ValidationError("IMEI required", "imei");
  }

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
      rawPhone1
      rawPhone2
      rawControlPhone
    }
  }`;

  const result = await sendQuery(q);

  const rawData = result.analyticsDataByImei || [];

  const validated = validateAnalyticsData(rawData);
  const cleaned = normalize(validated);

  return sortPackets(cleaned);
}

export async function getAnalyticsHealth(imei: string) {
  const q = `
  {
    analyticsHealth(imei: "${imei}") {
      gpsScore
      movement
      movementStats
      temperatureHealthIndex
      temperatureStatus
    }
  }`;

  const result = await sendQuery(q);
  return result.analyticsHealth || null;
}

export async function getAnalyticsUptime(imei: string) {
  const q = `
  {
    analyticsUptime(imei: "${imei}") {
      score
      expectedPackets
      receivedPackets
      largestGapSec
      dropouts
    }
  }`;

  const result = await sendQuery(q);
  return result.analyticsUptime || null;
}

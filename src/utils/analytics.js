const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL;

/* ---------------------------------------------------------
   Send GraphQL Query (POST) with Enhanced Error Handling
--------------------------------------------------------- */
export async function sendQuery(queryString, retryOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, exponentialBackoff = true } = retryOptions;
  
  if (!queryString || !queryString.trim()) {
    throw new Error("Missing GraphQL query");
  }

  console.log("🔍 Analytics Query:", queryString.substring(0, 200) + "...");
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(`${API_BASE_URL}/analytics/analytics-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ query: queryString }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check response status and headers
      console.log("📡 Response Status:", res.status, res.statusText);
      console.log("📏 Response Size:", res.headers.get('content-length') || 'unknown');
      
      // Handle HTTP errors
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        
        // Categorize HTTP errors
        if (res.status >= 500) {
          throw new NetworkError(`Server error (${res.status}): ${res.statusText}`, res.status, true);
        } else if (res.status === 404) {
          throw new ApiError(`Endpoint not found (${res.status}): ${res.statusText}`, res.status, false);
        } else if (res.status === 401 || res.status === 403) {
          throw new ApiError(`Authentication error (${res.status}): ${res.statusText}`, res.status, false);
        } else if (res.status >= 400) {
          throw new ApiError(`Client error (${res.status}): ${res.statusText}`, res.status, false);
        }
        
        throw new NetworkError(`HTTP error (${res.status}): ${res.statusText}`, res.status, true);
      }
      
      const responseText = await res.text();
      console.log("📄 Response Length:", responseText.length, "characters");
      
      // Validate response content
      if (!responseText || responseText.trim().length === 0) {
        throw new ApiError("Empty response received from server", res.status, true);
      }
      
      // Check if response is truncated (incomplete JSON)
      const isTruncated = !responseText.trim().endsWith('}') && !responseText.trim().endsWith(']');
      if (isTruncated) {
        console.error("⚠️ TRUNCATED RESPONSE DETECTED!");
        console.error("Last 100 chars:", responseText.slice(-100));
        throw new ApiError("API Response was truncated - data incomplete", res.status, true);
      }

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError.message);
        console.error("Response preview:", responseText.substring(0, 500));
        throw new ApiError("Invalid JSON response - likely corrupted data", res.status, true);
      }

      // Handle GraphQL errors
      if (json?.errors) {
        console.error("GraphQL Errors:", json.errors);
        const errorMessage = json.errors[0]?.message || "GraphQL Error";
        
        // Check if it's a data validation error (not retryable)
        const isValidationError = json.errors.some(err => 
          err.message?.includes('validation') || 
          err.message?.includes('invalid') ||
          err.extensions?.code === 'VALIDATION_ERROR'
        );
        
        throw new ApiError(errorMessage, res.status, !isValidationError);
      }

      // Validate data structure
      if (json.data === undefined) {
        throw new ApiError("Response missing data field", res.status, true);
      }

      console.log("✅ Response parsed successfully");
      return json.data;
      
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error instanceof ApiError && !error.retryable) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay for next retry
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay;
      
      console.warn(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, error.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/* ---------------------------------------------------------
   Custom Error Classes for Better Error Handling
--------------------------------------------------------- */
export class NetworkError extends Error {
  constructor(message, statusCode = null, retryable = true) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

export class ApiError extends Error {
  constructor(message, statusCode = null, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.retryable = false;
    this.timestamp = new Date().toISOString();
  }
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
export function sortPackets(arr) {
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
export function normalize(list) {
  if (!Array.isArray(list)) return [];

  return list.map((p) => ({
    ...p,
    __timestamp: extractTimestamp(p),
  }));
}

/* ---------------------------------------------------------
   Data Validation Utilities
--------------------------------------------------------- */
export function validateAnalyticsData(data) {
  if (!data) {
    throw new ValidationError("Analytics data is null or undefined");
  }
  
  if (!Array.isArray(data)) {
    throw new ValidationError("Analytics data must be an array");
  }
  
  // Validate each packet has required fields
  const validatedData = data.map((packet, index) => {
    if (!packet || typeof packet !== 'object') {
      console.warn(`Invalid packet at index ${index}:`, packet);
      return null;
    }
    
    // Validate required fields exist
    const requiredFields = ['id', 'imei'];
    const missingFields = requiredFields.filter(field => !packet[field]);
    
    if (missingFields.length > 0) {
      console.warn(`Packet ${index} missing required fields:`, missingFields);
      return null;
    }
    
    // Validate and normalize numeric fields
    // NOTE: rawTemperature is NOT included here because it comes as a string with units (e.g., "22.12 c")
    // and needs to be parsed by parseTemperature() function in telemetryTransformers.js
    const numericFields = ['latitude', 'longitude', 'speed', 'battery'];
    const normalizedPacket = { ...packet };
    
    numericFields.forEach(field => {
      if (packet[field] !== undefined && packet[field] !== null) {
        const numValue = Number(packet[field]);
        if (isNaN(numValue)) {
          console.warn(`Invalid numeric value for ${field} in packet ${index}:`, packet[field]);
          normalizedPacket[field] = 0; // Default to 0 for invalid numeric values
        } else {
          normalizedPacket[field] = numValue;
        }
      }
    });
    
    return normalizedPacket;
  }).filter(packet => packet !== null); // Remove invalid packets
  
  return validatedData;
}

export function validateHealthData(data) {
  if (!data) {
    return null; // Health data is optional
  }
  
  if (typeof data !== 'object') {
    console.warn("Health data must be an object:", data);
    return null;
  }
  
  // Validate numeric fields
  const numericFields = ['gpsScore', 'temperatureHealthIndex'];
  const normalizedData = { ...data };
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const numValue = Number(data[field]);
      if (isNaN(numValue)) {
        console.warn(`Invalid numeric value for ${field} in health data:`, data[field]);
        normalizedData[field] = 0;
      } else {
        normalizedData[field] = numValue;
      }
    }
  });
  
  return normalizedData;
}

/* ---------------------------------------------------------
   Enhanced API Functions with Validation and Error Handling
--------------------------------------------------------- */
/* ---------------------------------------------------------
   1. Get ALL analytics
--------------------------------------------------------- */
export async function getAllAnalytics(retryOptions = {}) {
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

  try {
    const result = await sendQuery(q, retryOptions);
    const rawData = result.analyticsData || [];
    const validatedData = validateAnalyticsData(rawData);
    const cleaned = normalize(validatedData);
    return sortPackets(cleaned);
  } catch (error) {
    console.error('Failed to fetch all analytics:', error);
    throw new ApiError(`Failed to fetch analytics data: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   2. Paginated
--------------------------------------------------------- */
export async function getAnalyticsPaginated(skip = 0, limit = 10, retryOptions = {}) {
  // Validate input parameters
  if (skip < 0 || limit <= 0 || limit > 1000) {
    throw new ValidationError("Invalid pagination parameters", "pagination");
  }

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

  try {
    const result = await sendQuery(q, retryOptions);
    const rawData = result.analyticsDataPaginated || [];
    const validatedData = validateAnalyticsData(rawData);
    const cleaned = normalize(validatedData);
    return sortPackets(cleaned);
  } catch (error) {
    console.error('Failed to fetch paginated analytics:', error);
    throw new ApiError(`Failed to fetch paginated analytics: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   3. Get by ID
--------------------------------------------------------- */
export async function getAnalyticsById(id, retryOptions = {}) {
  // Validate input
  if (!id || typeof id !== 'string') {
    throw new ValidationError("Valid ID is required", "id");
  }

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

  try {
    const result = await sendQuery(q, retryOptions);
    
    if (!result.analyticsDataById) {
      throw new ApiError(`No data found for ID: ${id}`, 404, false);
    }
    
    // Validate single record
    const validatedData = validateAnalyticsData([result.analyticsDataById]);
    if (validatedData.length === 0) {
      throw new ApiError(`Invalid data structure for ID: ${id}`, null, false);
    }
    
    return {
      ...validatedData[0],
      __timestamp: extractTimestamp(validatedData[0]),
    };
  } catch (error) {
    console.error(`Failed to fetch analytics by ID ${id}:`, error);
    if (error instanceof ValidationError || error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Failed to fetch analytics by ID: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   4. Get by TOPIC
--------------------------------------------------------- */
export async function getAnalyticsByTopic(topic, retryOptions = {}) {
  // Validate input
  if (!topic || typeof topic !== 'string') {
    throw new ValidationError("Valid topic is required", "topic");
  }

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

  try {
    const result = await sendQuery(q, retryOptions);
    const rawData = result.analyticsDataByTopic || [];
    const validatedData = validateAnalyticsData(rawData);
    const cleaned = normalize(validatedData);
    return sortPackets(cleaned);
  } catch (error) {
    console.error(`Failed to fetch analytics by topic ${topic}:`, error);
    throw new ApiError(`Failed to fetch analytics by topic: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   5. Count
--------------------------------------------------------- */
export async function getAnalyticsCount(retryOptions = {}) {
  const q = `{ analyticsDataCount }`;

  try {
    const result = await sendQuery(q, retryOptions);
    const count = result.analyticsDataCount;
    
    if (typeof count !== 'number' || count < 0) {
      throw new ApiError("Invalid count value received", null, true);
    }
    
    return count;
  } catch (error) {
    console.error('Failed to fetch analytics count:', error);
    throw new ApiError(`Failed to fetch analytics count: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   6. Get by IMEI (FULL CLEAN) - Enhanced with validation
--------------------------------------------------------- */
export async function getAnalyticsByImei(imei, retryOptions = {}) {
  // Validate IMEI format
  if (!imei || typeof imei !== 'string') {
    throw new ValidationError("Valid IMEI is required", "imei");
  }
  
  // Basic IMEI format validation (15 digits)
  const imeiRegex = /^\d{15}$/;
  if (!imeiRegex.test(imei)) {
    throw new ValidationError(`Invalid IMEI format: ${imei}. IMEI must be 15 digits.`, "imei");
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
    }
  }`;

  try {
    const result = await sendQuery(q, retryOptions);
    const rawData = result.analyticsDataByImei || [];
    
    // Handle empty results gracefully
    if (rawData.length === 0) {
      console.info(`No analytics data found for IMEI: ${imei}`);
      return [];
    }
    
    const validatedData = validateAnalyticsData(rawData);
    const cleaned = normalize(validatedData);
    return sortPackets(cleaned);
  } catch (error) {
    console.error(`Failed to fetch analytics by IMEI ${imei}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ApiError(`Failed to fetch analytics for device ${imei}: ${error.message}`, error.statusCode, error.retryable);
  }
}

/* ---------------------------------------------------------
   7. DEVICE HEALTH (Enhanced with validation)
--------------------------------------------------------- */
export async function getAnalyticsHealth(imei, retryOptions = {}) {
  // Validate IMEI format
  if (!imei || typeof imei !== 'string') {
    throw new ValidationError("Valid IMEI is required for health data", "imei");
  }
  
  const imeiRegex = /^\d{15}$/;
  if (!imeiRegex.test(imei)) {
    throw new ValidationError(`Invalid IMEI format: ${imei}. IMEI must be 15 digits.`, "imei");
  }

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
  
  try {
    const result = await sendQuery(q, retryOptions);
    const healthData = result.analyticsHealth;
    
    // Health data is optional, so null is acceptable
    if (!healthData) {
      console.info(`No health data available for IMEI: ${imei}`);
      return null;
    }
    
    return validateHealthData(healthData);
  } catch (error) {
    console.error(`Failed to fetch health data for IMEI ${imei}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ApiError(`Failed to fetch health data for device ${imei}: ${error.message}`, error.statusCode, error.retryable);
  }
}

export async function getAnalyticsUptime(imei, retryOptions = {}) {
  // Validate IMEI format
  if (!imei || typeof imei !== 'string') {
    throw new ValidationError("Valid IMEI is required for uptime data", "imei");
  }
  
  const imeiRegex = /^\d{15}$/;
  if (!imeiRegex.test(imei)) {
    throw new ValidationError(`Invalid IMEI format: ${imei}. IMEI must be 15 digits.`, "imei");
  }

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
  
  try {
    const result = await sendQuery(q, retryOptions);
    const uptimeData = result.analyticsUptime;
    
    if (!uptimeData) {
      console.info(`No uptime data available for IMEI: ${imei}`);
      return null;
    }
    
    // Validate numeric fields
    const numericFields = ['score', 'expectedPackets', 'receivedPackets', 'largestGapSec', 'dropouts'];
    const validatedData = { ...uptimeData };
    
    numericFields.forEach(field => {
      if (uptimeData[field] !== undefined && uptimeData[field] !== null) {
        const numValue = Number(uptimeData[field]);
        if (isNaN(numValue)) {
          console.warn(`Invalid numeric value for ${field} in uptime data:`, uptimeData[field]);
          validatedData[field] = 0;
        } else {
          validatedData[field] = numValue;
        }
      }
    });
    
    return validatedData;
  } catch (error) {
    console.error(`Failed to fetch uptime data for IMEI ${imei}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ApiError(`Failed to fetch uptime data for device ${imei}: ${error.message}`, error.statusCode, error.retryable);
  }
}


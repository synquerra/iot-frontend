import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export type TelemetryData = {
  id: string;
  topic: string;
  imei: string;
  interval: string;
  geoid: string | null;
  packet: string;
  latitude: string;
  longitude: string;
  speed: string;
  battery: string;
  signal: string;
  alert: string;
  timestamp: string;
  deviceTimestamp: string;
  deviceRawTimestamp: string;
  rawPacket: string;
  rawImei: string;
  rawAlert: string;
  type: string;
  rawTemperature: string;
  rawPhone1: string;
  rawPhone2: string;
  rawControlPhone: string;
};

interface UseTelemetryOptions {
  imei?: string;
  limit?: number;
  skip?: number;
  startDate?: string;
  endDate?: string;
}

export function useTelemetry({ imei, limit = 20, skip = 0, startDate, endDate }: UseTelemetryOptions) {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    if (!imei) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Formatting parameters for inline GraphQL query
      const params = [
        `imei: "${imei}"`,
        `skip: ${skip || 0}`,
        `limit: ${limit || 20}`
      ];

      if (startDate) params.push(`startDate: "${startDate}"`);
      if (endDate) params.push(`endDate: "${endDate}"`);

      const query = `{ 
        analyticsDataByImei(${params.join(", ")}) { 
          id topic imei interval geoid packet latitude longitude speed battery signal alert timestamp deviceTimestamp deviceRawTimestamp rawPacket rawImei rawAlert type rawTemperature rawPhone1 rawPhone2 rawControlPhone 
        } 
      }`;

      console.log("useTelemetry: Dispatching inline GraphQL query", { query });

      const res = await api.post('/analytics/analytics-query', { query });
      
      if (res.data?.errors) {
        const gqlError = res.data.errors[0]?.message || "GraphQL Error";
        throw new Error(gqlError);
      }

      if (res.data?.status === 'success' && res.data?.data?.analyticsDataByImei) {
        setData(res.data.data.analyticsDataByImei);
      } else if (res.data?.data?.analyticsDataByImei) {
        setData(res.data.data.analyticsDataByImei);
      } else {
        throw new Error(res.data?.message || "Failed to fetch telemetry data stream");
      }
    } catch (err: any) {
      console.error("useTelemetry Error:", err);
      setError(err.message || "An error occurred fetching telemetry data");
    } finally {
      setIsLoading(false);
    }
  }, [imei, skip, limit, startDate, endDate]);

  useEffect(() => {
    fetchTelemetry();
    
    let intervalId: any;
    if (!startDate && !endDate && imei) {
      intervalId = setInterval(() => fetchTelemetry(), 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchTelemetry, startDate, endDate, imei]);

  return { data, isLoading, error, refresh: fetchTelemetry };
}

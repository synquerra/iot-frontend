import { useState, useEffect } from 'react';
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

export function useTelemetry(imei?: string) {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      if (!imei) {
        setIsLoading(false);
        return;
      }

      setError(null);
      
      const query = `{
        analyticsDataByImei(imei: "${imei}") {
          id topic imei interval geoid packet latitude longitude speed battery signal alert timestamp deviceTimestamp deviceRawTimestamp rawPacket rawImei rawAlert type rawTemperature rawPhone1 rawPhone2 rawControlPhone
        }
      }`;

      const res = await api.post('/analytics/analytics-query', { query });
      
      if (res.data?.status === 'success' && res.data?.data?.analyticsDataByImei) {
        let logs: TelemetryData[] = res.data.data.analyticsDataByImei;
        
        setData(logs);
      } else {
        throw new Error("Failed to fetch telemetry data stream");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching telemetry data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    
    // Auto-refresh every 15 seconds to keep log view alive
    const interval = setInterval(() => fetchTelemetry(), 15000);
    return () => clearInterval(interval);
  }, [imei]);

  return { data, isLoading, error, refresh: fetchTelemetry };
}

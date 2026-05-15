import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/axios";

export type LiveLocation = {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
  battery: number;
  signal: number;
  geoid: string | null;
};

export function useLiveLocation(imei: string, intervalMs: number = 3000) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!imei) return;

    try {
      const query = `query { 
        analyticsDataByImei(imei: "${imei}", skip: 0, limit: 2) { 
          latitude longitude speed battery signal timestamp geoid
        } 
      }`;

      const res = await api.post("/analytics/analytics-query", { query });
      
      if (res.data?.errors) {
        throw new Error(res.data.errors[0]?.message || "GraphQL Error");
      }

      const data = res.data?.data?.analyticsDataByImei?.[0];
      if (data) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setLocation({
            latitude: lat,
            longitude: lng,
            speed: parseFloat(data.speed) || 0,
            timestamp: data.timestamp,
            battery: parseInt(data.battery, 10) || 0,
            signal: parseInt(data.signal, 10) || 0,
            geoid: data.geoid || null,
          });
          setError(null);
        } else {
          console.warn("Received invalid coordinates:", data.latitude, data.longitude);
        }
      }
    } catch (err: any) {
      console.error("Live location fetch failed:", err);
      setError(err.message || "Failed to fetch live location");
    } finally {
      setIsLoading(false);
    }
  }, [imei]);

  useEffect(() => {
    fetchLocation();
    pollingRef.current = setInterval(fetchLocation, intervalMs);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchLocation, intervalMs]);

  return { location, isLoading, error };
}

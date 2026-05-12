import api from "@/lib/axios";
import type { Device, DeviceOverview, AnalyticsHealth } from "@/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getDeviceByImei } from "@/features/devices/services/deviceService";
import { getLatestDeviceSettings, type LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";

function useDeviceOverview(imei: string) {
  const [deviceStatus, setDeviceOverview] = useState<DeviceOverview | null>(
    null,
  );
  const [analyticsHealth, setAnalyticsHealth] = useState<AnalyticsHealth | null>(null);

  const [device, setDevice] = useState<Device | null>(null);
  const [deviceSettings, setDeviceSettings] = useState<LatestDeviceSettingsRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitialLoad = useRef<boolean>(true);
  const manualRefreshRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!imei) return;

    const fetchDeviceData = async () => {
      try {
        const target = await getDeviceByImei(imei);

        if (target) {
          // Update local state with the normalized device object
          setDevice(target);
          
          // Map Telemetry into Device Overview
          setDeviceOverview({
            id: target.topic,
            topic: target.topic,
            imei: target.imei,
            latitude: parseFloat(target.latitude || "0"),
            longitude: parseFloat(target.longitude || "0"),
            speed: parseFloat(target.speed || "0") || 0,
            rawTemperature: parseFloat(target.temperature || "0") || 0,
            battery: parseInt(target.battery || "0", 10) || 0,
            signal: parseInt(target.signal || "0", 10) || 0,
            gps_strength: target.gps_strength || "Unknown",
            timestamp: target.timestamp || null,
            packet: (target as any).packet || null,
          });

          return target;
        }

        throw new Error("Device not found");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch device data";
        setError(errorMessage);
        if (isInitialLoad.current) {
          toast.error(errorMessage);
        }
        throw err;
      }
    };

    const fetchOverview = async () => {
      try {
        // Poll telemetry concurrently
        if (!isInitialLoad.current) {
          await fetchDeviceData();
        }

        const res = await api.post("analytics/analytics-query", {
          query: `{
            analyticsHealth(imei: "${imei}") {
              gpsScore
              movement
              movementStats
              temperatureHealthIndex
              temperatureStatus
            }
          }`,
        });

        if (res.data?.data?.analyticsHealth) {
          setAnalyticsHealth(res.data.data.analyticsHealth);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch overview data";
        console.error("Overview fetch failed", err);
        setError(errorMessage);
        if (isInitialLoad.current) {
          toast.error(errorMessage);
        }
      }
    };

    const init = async () => {
      try {
        if (isInitialLoad.current) {
          setIsLoading(true);
        }
        setError(null);

        // 1️⃣ fetch device
        const deviceData = await fetchDeviceData();

        // 2️⃣ fetch overview once immediately
        await fetchOverview();

        // fetch device settings
        try {
          if (deviceData?.topic) {
            const settings = await getLatestDeviceSettings(deviceData.topic);
            setDeviceSettings(settings);
          }
        } catch (settingsErr) {
          console.error("Failed to fetch device settings", settingsErr);
        }

        // 3️⃣ determine polling interval
        const interval =
          deviceData?.interval != null
            ? deviceData.interval * 1000
            : 5 * 60 * 1000;

        // 4️⃣ start polling
        pollingRef.current = setInterval(fetchOverview, interval);

        if (isInitialLoad.current) {
          toast.success("Device overview loaded successfully");
          isInitialLoad.current = false;
        }
      } catch (err) {
        console.error("Device overview init failed", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize device overview";
        setError(errorMessage);
      } finally {
        if (isInitialLoad.current) {
          setIsLoading(false);
        } else {
          // If we are artificially refreshing silently without skeleton:
          setIsLoading(false); 
        }
      }
    };

    manualRefreshRef.current = init;
    init();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [imei]);

  const refresh = async () => {
    await manualRefreshRef.current();
  };

  return { deviceStatus, device, analyticsHealth, deviceSettings, isLoading, error, refresh };
}

export default useDeviceOverview;

import api from "@/lib/axios";
import type { Device, DeviceOverview, AnalyticsHealth } from "@/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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

  useEffect(() => {
    if (!imei) return;

    const fetchDeviceData = async () => {
      try {
        const res = await api.post("device/device-master-query", {
          query: `{
            deviceByTopic(topic: "${imei}/pub") {
              topic
              imei
              interval
              geoid
              createdAt
              studentName
              studentId
            }
          }`,
        });

        if (res.data?.data?.deviceByTopic) {
          setDevice(res.data.data.deviceByTopic);
          return res.data.data.deviceByTopic;
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
        const res = await api.post("analytics/analytics-query", {
          query: `{
            latestAnalyticsData(imei: "${imei}") {
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
              rawNormalSendingInterval
              rawSOSSendingInterval
              rawNormalScanningInterval
              rawAirplaneInterval
              rawSpeedLimit
              rawLowbatLimit
              type
            }
            analyticsHealth(imei: "${imei}") {
              gpsScore
              movement
              movementStats
              temperatureHealthIndex
              temperatureStatus
            }
          }`,
        });

        if (res.data?.data?.latestAnalyticsData) {
          setDeviceOverview(res.data.data.latestAnalyticsData);
          setError(null);
        }
        if (res.data?.data?.analyticsHealth) {
          setAnalyticsHealth(res.data.data.analyticsHealth);
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
        setIsLoading(true);
        setError(null);

        // 1️⃣ fetch device
        const deviceData = await fetchDeviceData();

        // 2️⃣ fetch overview once immediately
        await fetchOverview();

        // fetch device settings
        try {
          const settings = await getLatestDeviceSettings(imei);
          setDeviceSettings(settings);
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
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [imei]);

  return { deviceStatus, device, analyticsHealth, deviceSettings, isLoading, error };
}

export default useDeviceOverview;

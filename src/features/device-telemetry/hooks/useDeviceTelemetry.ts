import api from "@/lib/axios";
import type { Device, DeviceTelemetry } from "@/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function useDeviceTelemetry(imei: string) {
  const [deviceStatus, setDeviceTelemetry] = useState<DeviceTelemetry | null>(
    null,
  );
  const [device, setDevice] = useState<Device | null>(null);
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

    const fetchTelemetry = async () => {
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
          }`,
        });

        if (res.data?.data?.latestAnalyticsData) {
          setDeviceTelemetry(res.data.data.latestAnalyticsData);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch telemetry data";
        console.error("Telemetry fetch failed", err);
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

        // 2️⃣ fetch telemetry once immediately
        await fetchTelemetry();

        // 3️⃣ determine polling interval
        const interval =
          deviceData?.interval != null
            ? deviceData.interval * 1000
            : 5 * 60 * 1000;

        // 4️⃣ start polling
        pollingRef.current = setInterval(fetchTelemetry, interval);

        if (isInitialLoad.current) {
          toast.success("Device telemetry loaded successfully");
          isInitialLoad.current = false;
        }
      } catch (err) {
        console.error("Device telemetry init failed", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize device telemetry";
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

  return { deviceStatus, device, isLoading, error };
}

export default useDeviceTelemetry;

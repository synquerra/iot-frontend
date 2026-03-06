import api from "@/lib/axios";
import type { Device, DeviceTelemetry } from "@/types";
import { useEffect, useRef, useState } from "react";

function useDeviceTelemetry(imei: string) {
  const [deviceStatus, setDeviceTelemetry] = useState<DeviceTelemetry | null>(
    null,
  );
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!imei) return;

    const fetchDeviceData = async () => {
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

      return null;
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
        }
      } catch (err) {
        console.error("Telemetry fetch failed", err);
      }
    };

    const init = async () => {
      try {
        setIsLoading(true);

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
      } catch (err) {
        console.error("Device telemetry init failed", err);
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

  return { deviceStatus, device, isLoading };
}

export default useDeviceTelemetry;

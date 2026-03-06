import api from "@/lib/axios";
import type { Device, DeviceTelemetry } from "@/types";
import { useEffect, useState } from "react";

function useDeviceTelemetry(imei: string) {
  const [deviceStatus, setDeviceTelemetry] = useState<DeviceTelemetry | null>(
    null,
  );
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setIsLoading(true);

        const res = await api.post("device/device-master-query", {
          query: `{
            deviceByTopic(topic: \"${imei}/pub\") { topic imei interval geoid createdAt studentName studentId} }`,
        });

        if (res.data?.data?.deviceByTopic) {
          setDevice(res.data.data.deviceByTopic);
        }
      } catch (err) {
        console.error("Telemetry fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchTelemetry = async () => {
      try {
        setIsLoading(true);

        const res = await api.post("analytics/analytics-query", {
          query: `{
            latestAnalyticsData(imei: "${imei}") {
              id topic imei interval geoid packet latitude longitude speed battery signal alert timestamp deviceTimestamp deviceRawTimestamp rawPacket rawImei rawAlert rawTemperature rawPhone1 rawPhone2 rawControlPhone rawNormalSendingInterval rawSOSSendingInterval rawNormalScanningInterval rawAirplaneInterval rawSpeedLimit rawLowbatLimit type
            }
          }`,
        });

        if (res.data?.data?.latestAnalyticsData) {
          setDeviceTelemetry(res.data.data.latestAnalyticsData);
        }
      } catch (err) {
        console.error("Telemetry fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceData();
    fetchTelemetry();
  }, [imei]);

  return { deviceStatus, device, isLoading };
}

export default useDeviceTelemetry;

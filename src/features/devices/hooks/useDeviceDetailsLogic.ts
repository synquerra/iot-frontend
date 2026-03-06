import { useCallback, useEffect, useState } from "react";
import { type Device, getDeviceByTopic } from "../services/deviceService";
import {
  type AnalyticsHealth,
  type AnalyticsPacket,
  type AnalyticsUptime,
  getAnalyticsByImei,
  getAnalyticsHealth,
  getAnalyticsUptime,
} from "../utils/analytics";
import { detectTrips, type Packet, type Trip } from "../utils/tripDetection";

export function useDeviceDetailsLogic(imei: string) {
  const [packets, setPackets] = useState<AnalyticsPacket[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [health, setHealth] = useState<AnalyticsHealth | null>(null);
  const [uptime, setUptime] = useState<AnalyticsUptime | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const packetsData = await getAnalyticsByImei(imei);
      const healthData = await getAnalyticsHealth(imei);
      const uptimeData = await getAnalyticsUptime(imei);

      const topic = packetsData?.[0]?.topic || `${imei}/pub`;

      const deviceData = await getDeviceByTopic(topic);

      setPackets(packetsData || []);
      setHealth(healthData);
      setUptime(uptimeData);
      setDevice(deviceData);

      const tripPackets: Packet[] = (packetsData || [])
        .filter(
          (packet): packet is AnalyticsPacket & { deviceTimestamp: string } =>
            typeof packet.deviceTimestamp === "string",
        )
        .map((packet) => ({
          speed: packet.speed,
          latitude: packet.latitude,
          longitude: packet.longitude,
          deviceTimestamp: packet.deviceTimestamp,
        }));

      setTrips(detectTrips(tripPackets));
    } finally {
      setLoading(false);
    }
  }, [imei]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    packets,
    device,
    health,
    uptime,
    trips,
    loading,
    refresh: load,
  };
}

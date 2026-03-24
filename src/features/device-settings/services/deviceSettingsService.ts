import api from "@/lib/axios";

export type LatestDeviceSettingsRecord = {
  topic?: string | null;
  imei?: string | null;
  type?: string | null;
  device_timestamp?: string | null;
  raw_phonenum1?: string | null;
  raw_phonenum2?: string | null;
  raw_controlroomnum?: string | null;
  raw_NormalSendingInterval?: string | null;
  raw_SOSSendingInterval?: string | null;
  raw_NormalScanningInterval?: string | null;
  raw_AirplaneInterval?: string | null;
  raw_temperature?: string | null;
  raw_SpeedLimit?: string | null;
  raw_LowbatLimit?: string | null;
};

function extractLatestRecord(payload: unknown): LatestDeviceSettingsRecord | null {
  if (Array.isArray(payload)) {
    const first = payload[0];
    return first && typeof first === "object"
      ? (first as LatestDeviceSettingsRecord)
      : null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeWrapped = payload as { data?: unknown };

  if (Array.isArray(maybeWrapped.data)) {
    const first = maybeWrapped.data[0];
    return first && typeof first === "object"
      ? (first as LatestDeviceSettingsRecord)
      : null;
  }

  if (maybeWrapped.data && typeof maybeWrapped.data === "object") {
    return maybeWrapped.data as LatestDeviceSettingsRecord;
  }

  return payload as LatestDeviceSettingsRecord;
}

export async function getLatestDeviceSettings(
  imei: string,
): Promise<LatestDeviceSettingsRecord | null> {
  const response = await api.get(`/${imei}/config-or-misc`, {
    params: { limit: 1 },
  });

  return extractLatestRecord(response.data);
}

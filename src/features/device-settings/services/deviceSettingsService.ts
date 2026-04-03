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
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeWrapped = payload as { data?: any };
  const rawData = maybeWrapped.data || payload;
  const target = Array.isArray(rawData) ? rawData[0] : rawData;

  if (!target || typeof target !== "object") {
    return null;
  }

  // Safely map the new REST schema onto the legacy frontend struct.
  return {
    topic: target.topic,
    imei: target.imei,
    type: target.type || target.current_profile, 
    device_timestamp: target.updated_at || target.created_at || target.device_timestamp,
    raw_phonenum1: target.phone_num1 ?? target.raw_phonenum1,
    raw_phonenum2: target.phone_num2 ?? target.raw_phonenum2,
    raw_controlroomnum: target.control_room_num ?? target.raw_controlroomnum,
    raw_NormalSendingInterval: target.normal_sending_interval ?? target.raw_NormalSendingInterval,
    raw_SOSSendingInterval: target.sos_sending_interval ?? target.raw_SOSSendingInterval,
    raw_NormalScanningInterval: target.normal_scanning_interval ?? target.raw_NormalScanningInterval,
    raw_AirplaneInterval: target.airplane_interval ?? target.raw_AirplaneInterval,
    raw_temperature: target.temperature_limit ?? target.raw_temperature,
    raw_SpeedLimit: target.speed_limit ?? target.raw_SpeedLimit,
    raw_LowbatLimit: target.lowbat_limit ?? target.raw_LowbatLimit,
  } as LatestDeviceSettingsRecord;
}

export async function getLatestDeviceSettings(
  topicStr: string,
): Promise<LatestDeviceSettingsRecord | null> {
  const response = await api.get(`/setting/get`, {
    params: { topic: topicStr },
  });

  return extractLatestRecord(response.data);
}
export async function updateDeviceCoreSettings(
  payload: {
    topic: string;
    NormalSendingInterval: number;
    SOSSendingInterval: number;
    NormalScanningInterval: number;
    AirplaneInterval: number;
    SpeedLimit: number;
    LowbatLimit: number;
    TemperatureLimit: number;
  }
) {
  const response = await api.put(`/setting/update-core`, payload);
  return response.data;
}

export const API_ENDPOINT = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/send`;

export const COMMANDS = {
  STOP_SOS: "STOP_SOS",
  QUERY_NORMAL: "QUERY_NORMAL",
  QUERY_GEOFENCE: "QUERY_GEOFENCE",
  QUERY_DEVICE_SETTINGS: "QUERY_DEVICE_SETTINGS",
  SET_CONTACTS: "SET_CONTACTS",
  SET_GEOFENCE: "SET_GEOFENCE",
  DEVICE_SETTINGS: "DEVICE_SETTINGS",
  CALL_ENABLE: "CALL_ENABLE",
  CALL_DISABLE: "CALL_DISABLE",
  LED_ON: "LED_ON",
  LED_OFF: "LED_OFF",
  AMBIENT_ENABLE: "AMBIENT_ENABLE",
  AMBIENT_DISABLE: "AMBIENT_DISABLE",
  AMBIENT_STOP: "AMBIENT_STOP",
  AIRPLANE_ENABLE: "AIRPLANE_ENABLE",
  GPS_DISABLE: "GPS_DISABLE",
  FOTA_UPDATE: "FOTA_UPDATE",
} as const;

export const PARAM_SCHEMAS = {
  SET_CONTACTS: ["phonenum1", "phonenum2", "controlroomnum"],
  SET_GEOFENCE: ["geofence_number", "geofence_id", "coordinates"],
  DEVICE_SETTINGS: [
    "NormalSendingInterval",
    "SOSSendingInterval",
    "NormalScanningInterval",
    "AirplaneInterval",
    "TemperatureLimit",
    "SpeedLimit",
    "LowbatLimit",
  ],
  FOTA_UPDATE: ["FOTA", "CRC", "size", "vc"],
} as const;

export type DeviceCommand = (typeof COMMANDS)[keyof typeof COMMANDS];

export type DeviceCommandParams = Record<string, unknown>;

export type ValidationResult = {
  valid: true;
} | {
  valid: false;
  error: string;
};

export type DeviceCommandCode =
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "API_ERROR";

export interface DeviceCommandError extends Error {
  code: DeviceCommandCode;
  details?: unknown;
}

export interface GeofenceCoordinate {
  latitude: number;
  longitude: number;
}

export interface DeviceCommandRequest {
  imei: string;
  command: string;
  params: DeviceCommandParams;
}

export interface DeviceCommandResponse<TData = unknown> {
  success: boolean;
  message?: string;
  data: TData;
}

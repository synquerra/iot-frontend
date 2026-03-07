interface DeviceTelemetry {
  id?: string;
  topic?: string;

  imei?: string;
  interval?: number | string;
  geoid?: number | string;
  packet?: number | string;

  latitude?: number | string;
  longitude?: number | string;
  speed?: number;

  battery?: number | string;
  signal?: number | string;

  alert?: string;

  timestamp?: string;
  deviceTimestamp?: string;
  deviceRawTimestamp?: string;

  rawPacket?: string;
  rawImei?: string;
  rawAlert?: string;
  rawTemperature?: number | string;

  rawPhone1?: string;
  rawPhone2?: string;
  rawControlPhone?: string;

  rawNormalSendingInterval?: number | string;
  rawSOSSendingInterval?: number | string;
  rawNormalScanningInterval?: number | string;
  rawAirplaneInterval?: number | string;

  rawSpeedLimit?: number | string;
  rawLowbatLimit?: number | string;

  type?: string;
}
export interface Device {
  topic?: string;
  imei?: string;
  interval?: number;
  geoid?: string;
  createdAt?: string;

  studentName?: string;
  studentId?: string;
}
export interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  color?: string;
  children?: React.ReactNode;
}
export interface DeviceData {
  name: string;
  imei: string;
  status: string;
  temperature: number;
  battery: number;
  speed: number;
  latitude: number;
  longitude: number;
  signal: number;
  gpsSignal: number;
  satellites: number;
  distance: string;
  steps: number;
  performance: number;
  lastUpdate: string;
  guardian1: string;
  guardian1Phone: string;
  guardian2: string;
  guardian2Phone: string;
  dataInterval: string;
  audioRecording: boolean;
  aeroplaneMode: boolean;
  ble: boolean;
  ledStatus: boolean;
  currentMode: string;
  alert: string;
  safetyEvents: number;
  crawling: number;
  stationary: number;
  overspeeding: number;
  firmware: string;
  storage: number;
  ram: number;
}

export interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  color?: string;
  children?: React.ReactNode;
}

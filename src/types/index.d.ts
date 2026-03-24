interface DeviceOverview {
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


export interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  color?: string;
  children?: React.ReactNode;
}


export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface AnalyticsHealth {
  gpsScore: number;
  movement: string[];
  movementStats: string[];
  temperatureHealthIndex: number;
  temperatureStatus: string;
}

export interface Geofence {
  id?: string;
  imei: string;
  geofence_number: string;
  geofence_id: string;
  coordinates: Coordinate[];
  created_at: string;
}
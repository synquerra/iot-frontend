
export type GeofenceCoordinate = {
  lat: number;
  lng: number;
};

export type GeofenceRecord = {
  geofence_id: string;
  geofence_name: string;
  is_active: boolean;
  geofence_number: string | null; // GEO1, GEO2, GEO3 or null
  coordinates?: GeofenceCoordinate[];
  description?: string;
  color?: string;
  trigger_mode?: "Normal" | string;
  entry_alert_delay?: number;
  exit_alert_delay?: number;
  sms_alert?: boolean;
  push_notification_alert?: boolean;
  adoptive_geofence?: boolean;
  flag?: string;
};

export type CreateGeofencePayload = {
  imei: string;
  geofence_name: string;
  is_active: boolean;
  coordinates: GeofenceCoordinate[];
  description?: string;
  color?: string;
  trigger_mode?: string;
  entry_alert_delay?: number;
  exit_alert_delay?: number;
  sms_alert?: boolean;
  push_notification_alert?: boolean;
  adoptive_geofence?: boolean;
  flag?: string;
};

export type EditGeofencePayload = CreateGeofencePayload & {
  geofence_id: string;
};

export type GeofenceAssignment = {
  imei: string;
  geofence_id: string;
  geofence_number: "GEO1" | "GEO2" | "GEO3";
  status?: "ACTIVE" | "PENDING" | "ERROR";
};

export type GeofenceListResponse = {
  status: string;
  data: GeofenceRecord[];
};

export type ActiveGeofence = {
  id: string;
  coordinates: [number, number][];
  color: string;
};

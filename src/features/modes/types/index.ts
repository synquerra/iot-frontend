export type ModeType = "system" | "custom";

export interface DeviceMode {
  id: string;
  name: string;
  description: string;
  normal_sending_interval: number;
  sos_sending_interval: number;
  normal_scanning_interval: number;
  airplane_interval: number;
  temperature_limit: number;
  speed_limit: number;
  lowbat_limit: number;
  entry_condition: string;
  exit_condition: string;
  priority: number;
  watch_time: number;
  is_system_mode: boolean;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModePayload extends Omit<DeviceMode, "id" | "is_active" | "createdAt" | "updatedAt"> { }

export interface UpdateModePayload extends Partial<CreateModePayload> {
  id: string;
}

export interface ModeResponse {
  status: "success" | "error";
  message?: string;
  data: DeviceMode[];
}

export interface SingleModeResponse {
  status: "success" | "error";
  message?: string;
  data: DeviceMode;
}

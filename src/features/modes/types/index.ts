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
  allow_user_conditions: boolean;
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
export interface ModeCondition {
  id: string;
  mode_id: string;
  device_id: string | null;
  organization_id: string | null;
  condition_type: string;
  trigger: string;
  config: Record<string, any>;
  enabled: boolean;
  created_at?: string;
}

export interface CreateModeConditionPayload {
  mode_id: string;
  device_id?: string | null;
  organization_id?: string | null;
  condition_type: string;
  trigger: string;
  config: Record<string, any>;
  enabled?: boolean;
}

export interface UpdateModeConditionPayload extends CreateModeConditionPayload {
  id: string;
}

export interface ModeConditionResponse {
  status: "success" | "error";
  message?: string;
  data: ModeCondition[];
}

export interface SingleModeConditionResponse {
  status: "success" | "error";
  message?: string;
  data: ModeCondition;
}

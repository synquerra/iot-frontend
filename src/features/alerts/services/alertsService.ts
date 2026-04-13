import api from "@/lib/axios";

export interface AlertErrorItem {
  id: string;
  imei: string;
  topic: string;
  code: string;
  type: "alert" | "error";
  description: string;
  severity: string;
  is_acknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  request_id: string;
  secure: boolean;
  message: string;
  timestamp: string;
  data: T;
}

export async function getAlerts(): Promise<AlertErrorItem[]> {
  const { data } = await api.get<ApiResponse<AlertErrorItem[]>>("/alerts-errors/alerts");
  return data.data;
}

export async function getErrors(): Promise<AlertErrorItem[]> {
  const { data } = await api.get<ApiResponse<AlertErrorItem[]>>("/alerts-errors/errors");
  return data.data;
}

export async function acknowledgeAlert(id: string): Promise<void> {
  const { data } = await api.post("/alerts-errors/acknowledge", { id });
  if (data.status !== "success") {
    throw new Error(data.message || "Failed to acknowledge alert");
  }
}

export async function getDeviceIncidents(imei: string): Promise<AlertErrorItem[]> {
  const { data } = await api.get<ApiResponse<AlertErrorItem[]>>(`/alerts-errors/device?imei=${imei}`);
  return data.data;
}

export async function getDeviceErrors(imei: string): Promise<AlertErrorItem[]> {
  const { data } = await api.get<ApiResponse<AlertErrorItem[]>>(`/alerts-errors/device/errors?imei=${imei}`);
  return data.data;
}

export async function getDeviceAlerts(imei: string): Promise<AlertErrorItem[]> {
  const { data } = await api.get<ApiResponse<AlertErrorItem[]>>(`/alerts-errors/device/alerts?imei=${imei}`);
  return data.data;
}

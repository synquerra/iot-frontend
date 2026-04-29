import api from "@/lib/axios";

export interface RawMqttMessage {
  id: string;
  topic: string;
  imei: string;
  received_at: string;
  payload_text: string;
  payload_size: number;
  parse_status: string;
  message_type: string;
  raw_body: string | null;
  raw_data: Record<string, any>;
}

export interface RawMessagesResponse {
  imei: string;
  skip: number;
  limit: number;
  messages: RawMqttMessage[];
}

export interface SendCommandRequest {
  imei: string;
  payload: any;
  topic?: string;
  qos?: number;
}

export async function getLatestPacket(imei: string): Promise<RawMqttMessage> {
  const response = await api.get(`/device-testing/latest-packet/${imei}`);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Failed to fetch latest packet");
  }
  return response.data.data;
}

export async function getRawMessages(
  imei: string,
  skip: number = 0,
  limit: number = 100
): Promise<RawMessagesResponse> {
  const response = await api.get(
    `/device-testing/raw-messages/${imei}?skip=${skip}&limit=${limit}`
  );
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Failed to fetch raw messages");
  }
  return response.data.data;
}

export async function sendTestCommand(payload: SendCommandRequest) {
  const response = await api.post("/device-testing/send-command", payload);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Failed to send command");
  }
  return response.data.data;
}

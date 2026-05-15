import api from "@/lib/axios";
import type { FotaListResponse, CreateFotaPayload, EditFotaPayload } from "../types";

export async function listFotaUpdates(): Promise<FotaListResponse> {
  const response = await api.get("fota/list");
  return response.data;
}

export async function createFotaUpdate(payload: CreateFotaPayload): Promise<{ status: string; message: string }> {
  const response = await api.post("fota/add", payload);
  return response.data;
}

export async function editFotaUpdate(payload: EditFotaPayload): Promise<{ status: string; message: string }> {
  const response = await api.post("fota/edit", payload);
  return response.data;
}

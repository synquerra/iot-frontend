import api from "@/lib/axios";
import type { 
  CreateModePayload, 
  UpdateModePayload, 
  ModeResponse, 
  SingleModeResponse 
} from "../types";

/**
 * Service for managing device operating modes.
 * Uses query parameters for GET and DELETE operations as per project standard.
 */
export const listModes = async (): Promise<ModeResponse> => {
  const response = await api.get("mode/list");
  return response.data;
};

export const getModeById = async (id: string): Promise<SingleModeResponse> => {
  const response = await api.get("mode/find-by-id", { params: { id } });
  return response.data;
};

export const addMode = async (payload: CreateModePayload): Promise<SingleModeResponse> => {
  const response = await api.post("mode/add", payload);
  return response.data;
};

export const updateMode = async (payload: UpdateModePayload): Promise<SingleModeResponse> => {
  const response = await api.post("mode/update", payload);
  return response.data;
};

export const deleteMode = async (id: string): Promise<{ status: string; message: string }> => {
  // Postman uses POST for delete, so we follow that method but use query params for the ID
  const response = await api.post("mode/delete", null, { params: { id } });
  return response.data;
};

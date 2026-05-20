import api from "@/lib/axios";
import type {
  CreateModeConditionPayload,
  UpdateModeConditionPayload,
  ModeConditionResponse,
  SingleModeConditionResponse,
} from "../types";

/**
 * Service for managing mode switching conditions.
 */
export const listModeConditions = async (): Promise<ModeConditionResponse> => {
  const response = await api.get("mode-condition/list");
  return response.data;
};

export const getModeConditionById = async (id: string): Promise<SingleModeConditionResponse> => {
  const response = await api.get("mode-condition/find-by-id", { params: { id } });
  return response.data;
};

export const getModeConditionsByModeId = async (modeId: string): Promise<ModeConditionResponse> => {
  const response = await api.get("mode-condition/find-by-mode", { params: { mode_id: modeId } });
  return response.data;
};

export const addModeCondition = async (payload: CreateModeConditionPayload): Promise<SingleModeConditionResponse> => {
  const response = await api.post("mode-condition/add", payload);
  return response.data;
};

export const updateModeCondition = async (payload: UpdateModeConditionPayload): Promise<SingleModeConditionResponse> => {
  const response = await api.post("mode-condition/update", payload);
  return response.data;
};

export const deleteModeCondition = async (id: string): Promise<{ status: string; message: string }> => {
  const response = await api.post("mode-condition/delete", null, { params: { id } });
  return response.data;
};

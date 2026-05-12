import api from "@/lib/axios";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserListResponse,
  UserDetailResponse,
  GenericResponse,
} from "../types";

export const listUsers = async (): Promise<UserListResponse> => {
  const response = await api.get("/user/list");
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<UserDetailResponse> => {
  const response = await api.post("/user/add", payload);
  return response.data;
};

export const updateUser = async (payload: UpdateUserPayload): Promise<UserDetailResponse> => {
  const response = await api.post("/user/update", payload);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<GenericResponse> => {
  const response = await api.delete(`/user/delete/${userId}`);
  return response.data;
};

export const getUserById = async (userId: string): Promise<UserDetailResponse> => {
  const response = await api.get(`/user/find-by-id/${userId}`);
  return response.data;
};

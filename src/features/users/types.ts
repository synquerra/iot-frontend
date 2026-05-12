export type UserRole = "admin" | "fota" | "testing";

export interface User {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  mobile: string;
  user_type: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  mobile: string;
  user_type: string;
  password?: string;
}

export interface UpdateUserPayload extends CreateUserPayload {
  user_id: string;
  is_active: boolean;
}

export interface UserListResponse {
  status: string;
  data: User[];
  message?: string;
}

export interface UserDetailResponse {
  status: string;
  data: User;
  message?: string;
}

export interface GenericResponse {
  status: string;
  message: string;
}

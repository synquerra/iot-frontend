export interface FotaUpdate {
  id: string;
  version_name: string;
  version_code: string;
  file_url: string;
  file_size: string;
  release_notes: string;
  created_at: string;
  updated_at: string;
}

export interface FotaListResponse {
  status: string;
  code: number;
  message: string;
  data: FotaUpdate[];
}

export interface CreateFotaPayload {
  version_name: string;
  version_code: number;
  file_url: string;
  file_size: number;
  release_notes: string;
}

export interface EditFotaPayload extends CreateFotaPayload {
  id: string;
}

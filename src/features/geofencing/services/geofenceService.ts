import api from "@/lib/axios";
import type {
  GeofenceListResponse,
  CreateGeofencePayload,
  EditGeofencePayload,
  GeofenceRecord,
} from "../types";

export async function listGeofences(imei: string): Promise<GeofenceListResponse> {
  const response = await api.get(`/geofence/list/${imei}`);
  return response.data;
}

export async function createGeofence(payload: CreateGeofencePayload): Promise<{ status: string; data: GeofenceRecord }> {
  const response = await api.post("/geofence/create", payload);
  return response.data;
}

export async function editGeofence(payload: EditGeofencePayload): Promise<{ status: string; data: GeofenceRecord }> {
  const response = await api.post("/geofence/edit", payload);
  return response.data;
}

export async function deleteGeofence(imei: string, geofenceId: string): Promise<{ status: string; message: string }> {
  const response = await api.post("/geofence/delete", { imei, geofence_id: geofenceId });
  return response.data;
}

export async function getGeofenceDetails(imei: string, geofenceId: string): Promise<{ status: string; data: GeofenceRecord }> {
  const response = await api.get(`/geofence/get/${imei}/${geofenceId}`);
  return response.data;
}

export async function assignGeofences(imei: string, assignments: { geofence_id: string; geofence_number: string }[]): Promise<{ status: string; message: string; data: any[] }> {
  // Ensure we only send the fields the API expects based on the example payload
  const formattedAssignments = assignments.map(a => ({
    geofence_id: a.geofence_id,
    geofence_number: a.geofence_number
  }));
  
  const response = await api.post("/geofence/assign", { 
    imei, 
    assignments: formattedAssignments 
  });
  return response.data;
}

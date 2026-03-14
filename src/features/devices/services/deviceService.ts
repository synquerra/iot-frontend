import api from "@/lib/axios";
import type { Geofence } from "@/types";

export type RawDevice = {
  topic: string;
  imei: string;
  interval?: string | null;
  geoid?: string | null;
  createdAt?: string | null;
  studentName?: string | null;
  studentId?: string | null;
};

export type Device = {
  topic: string;
  imei: string;
  displayName: string;
  status: "active" | "inactive";
  studentName: string | null;
  studentId: string | null;
  geoid?: string | null;
  createdAt?: string | null;
};

async function graphqlRequest<T>(query: string): Promise<T> {
  const { data } = await api.post("/device/device-master-query", { query });

  if (!data || data.status !== "success") {
    throw new Error(data?.error_description || "GraphQL request failed");
  }

  return data.data;
}

function normalizeDevice(device: RawDevice): Device {
  const status =
    device.interval && device.interval !== "-" ? "active" : "inactive";

  return {
    topic: device.topic,
    imei: device.imei,
    displayName: device.studentName || device.topic || device.imei,
    status,
    studentName: device.studentName ?? null,
    studentId: device.studentId ?? null,
    geoid: device.geoid ?? null,
    createdAt: device.createdAt ?? null,
  };
}

export async function listDevices(): Promise<Device[]> {
  const query = `
    query GetDevices {
      devices {
        topic
        imei
        interval
        geoid
        createdAt
        studentName
        studentId
      }
    }
  `;

  const data = await graphqlRequest<{ devices: RawDevice[] }>(query);
  const devices = Array.isArray(data.devices) ? data.devices : [];

  return devices.map(normalizeDevice);
}
export async function listDeviceGeofences(imei: string): Promise<Geofence[]> {
  const response = await api.get(`/list/${imei}`);


  const deviceGeofences = Array.isArray(response.data.data) ? response.data.data : [];


  const geofences: Geofence[] = deviceGeofences.map((g: any) => {


    return ({
      id: g.id,
      imei: g.imei,
      geofence_number: g.geofence_number,
      geofence_id: g.geofence_id,
      created_at: g.created_at,
      coordinates: (g.coordinates || []).map((c: any) => ({
        latitude: c.lat,
        longitude: c.lng,
      })),
    })
  });

  return geofences;
}

export async function getDeviceByTopic(topic: string): Promise<Device | null> {
  const query = `{
    deviceByTopic(topic: "${topic}") {
      topic
      imei
      interval
      geoid
      createdAt
      studentName
      studentId
    }
  }`;

  const data = await graphqlRequest<{ deviceByTopic: RawDevice | null }>(query);

  if (!data.deviceByTopic) return null;

  return normalizeDevice(data.deviceByTopic);
}

import api from "@/lib/axios"; // adjust path if needed

/* ================================
   Types
================================ */

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

/* ================================
   GraphQL Helper
================================ */

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.post("/device/device-master-query", {
    query,
    variables,
  });

  if (!data || data.status !== "success") {
    throw new Error(data?.error_description || "GraphQL request failed");
  }

  return data.data;
}

/* ================================
   Normalizer
================================ */

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

/* ================================
   Service Methods
================================ */

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

  const data = await graphqlRequest<{
    devices: RawDevice[];
  }>(query);

  const devices = Array.isArray(data.devices) ? data.devices : [];

  return devices.map(normalizeDevice);
}

export async function getDeviceByTopic(topic: string): Promise<Device | null> {
  const query = `{deviceByTopic(topic: "${topic}") { topic imei interval geoid createdAt studentName studentId} }`;
  const data = await graphqlRequest<{
    deviceByTopic: RawDevice | null;
  }>(query, { topic });

  if (!data.deviceByTopic) return null;

  return normalizeDevice(data.deviceByTopic);
}

export async function getDeviceByImei(imei: string): Promise<Device | null> {
  const query = `
    query GetDeviceByImei($imei: String!) {
      deviceByImei(imei: $imei) {
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

  const data = await graphqlRequest<{
    deviceByImei: RawDevice | null;
  }>(query, { imei });

  if (!data.deviceByImei) return null;

  return normalizeDevice(data.deviceByImei);
}

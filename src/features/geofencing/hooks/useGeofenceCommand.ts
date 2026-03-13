import { useCallback, useState } from "react";

import { COMMANDS, type GeofenceCoordinate } from "@/helpers/deviceCommandConstants";
import { sendDeviceCommand } from "@/helpers/deviceCommandHelper";

export type GeofencePayload = {
  geofence_number: string;
  geofence_id: string;
  coordinates: GeofenceCoordinate[];
};

export type GeofenceCommandRecord = {
  geofenceNumber: string;
  geofenceId: string;
  coordinates: GeofenceCoordinate[];
};

type QueryGeofenceResponse =
  | GeofenceCommandRecord[]
  | {
      geofences?: unknown;
      data?: unknown;
    }
  | null
  | undefined;

function isCoordinate(value: unknown): value is GeofenceCoordinate {
  return Boolean(
    value &&
      typeof value === "object" &&
      "latitude" in value &&
      "longitude" in value &&
      typeof (value as GeofenceCoordinate).latitude === "number" &&
      typeof (value as GeofenceCoordinate).longitude === "number",
  );
}

function closePolygon(coordinates: GeofenceCoordinate[]) {
  if (coordinates.length === 0) {
    return [];
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (first.latitude === last.latitude && first.longitude === last.longitude) {
    return coordinates;
  }

  return [...coordinates, first];
}

function normalizeGeofenceRecord(
  geofence: unknown,
  fallbackIndex: number,
): GeofenceCommandRecord | null {
  if (!geofence || typeof geofence !== "object") {
    return null;
  }

  const raw = geofence as Record<string, unknown>;
  const rawCoordinates = Array.isArray(raw.coordinates)
    ? raw.coordinates.filter(isCoordinate)
    : [];

  if (rawCoordinates.length < 3) {
    return null;
  }

  const geofenceNumber =
    typeof raw.geofence_number === "string" && raw.geofence_number.trim() !== ""
      ? raw.geofence_number
      : `GEO${fallbackIndex + 1}`;

  const geofenceId =
    typeof raw.geofence_id === "string" && raw.geofence_id.trim() !== ""
      ? raw.geofence_id
      : geofenceNumber;

  return {
    geofenceNumber,
    geofenceId,
    coordinates: closePolygon(rawCoordinates),
  };
}

function normalizeQueryResponse(
  response: QueryGeofenceResponse,
): GeofenceCommandRecord[] {
  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response?.geofences)
      ? response.geofences
      : Array.isArray(response?.data)
        ? response.data
        : [];

  return rawList
    .map((item, index) => normalizeGeofenceRecord(item, index))
    .filter((item): item is GeofenceCommandRecord => item !== null);
}

export function useGeofenceCommand() {
  const [geofences, setGeofences] = useState<GeofenceCommandRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeofences = useCallback(async (imei: string) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await sendDeviceCommand<QueryGeofenceResponse>(imei, COMMANDS.QUERY_GEOFENCE);
      const normalized = normalizeQueryResponse(response.data);
      setGeofences(normalized);
      return normalized;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch geofences";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setGeofence = useCallback(
    async (imei: string, payload: GeofencePayload) => {
      setLoading(true);
      setError(null);

      try {
        const normalizedPayload: GeofencePayload = {
          ...payload,
          coordinates: closePolygon(payload.coordinates),
        };

        const response = await sendDeviceCommand(
          imei,
          COMMANDS.SET_GEOFENCE,
          normalizedPayload,
        );

        const nextGeofence: GeofenceCommandRecord = {
          geofenceNumber: normalizedPayload.geofence_number,
          geofenceId: normalizedPayload.geofence_id,
          coordinates: normalizedPayload.coordinates,
        };

        setGeofences((current) => {
          const remaining = current.filter(
            (item) => item.geofenceNumber !== nextGeofence.geofenceNumber,
          );
          return [...remaining, nextGeofence];
        });

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set geofence";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeGeofenceLocally = useCallback((geofenceNumber: string) => {
    setGeofences((current) =>
      current.filter((item) => item.geofenceNumber !== geofenceNumber),
    );
  }, []);

  return {
    geofences,
    loading,
    error,
    fetchGeofences,
    setGeofence,
    removeGeofenceLocally,
  };
}

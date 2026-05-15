import { useCallback, useState } from "react";

import {
  COMMANDS,
  type DeviceCommandResponse,
  type GeofenceCoordinate,
  type GeofencePayloadCoordinate,
  type PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";
import { sendDeviceCommand } from "@/helpers/deviceCommandHelper";
import { listDeviceGeofences } from "@/features/devices/services/deviceService";
import type { Geofence } from "@/types";

export type GeofencePayload = {
  geofence_number: string;
  geofence_id: string;
  coordinates: GeofencePayloadCoordinate[];
};

export type GeofenceCommandRecord = {
  geofenceNumber: string;
  geofenceId: string;
  coordinates: GeofenceCoordinate[];
};

/* ------------------------------------------------ */
/* Hook */
/* ------------------------------------------------ */

export function useGeofenceCommand() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------- */
  /* Fetch existing geofences from API              */
  /* ---------------------------------------------- */

  const fetchGeofences = useCallback(async (imei: string) => {
    setLoading(true);
    setError(null);

    try {
      const geoFences: Geofence[] = await listDeviceGeofences(imei);
      setGeofences(geoFences);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch geofences";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------------------- */
  /* Set new geofence                               */
  /* ---------------------------------------------- */

  const setGeofence = useCallback(
    async (imei: string, payload: GeofencePayload) => {
      setLoading(true);
      setError(null);

      try {
        const response = await sendDeviceCommand<PublishedDeviceCommandResult>(
          imei,
          COMMANDS.SET_GEOFENCE,
          payload
        ) as DeviceCommandResponse<PublishedDeviceCommandResult>;

        const nextGeofence: GeofenceCommandRecord = {
          geofenceNumber: payload.geofence_number,
          geofenceId: payload.geofence_id,
          coordinates: payload.coordinates.map((coord) => ({ latitude: coord.lat, longitude: coord.lng })), // Convert to GeofenceCoordinate if needed
        };

        setGeofences((current) => {
          const remaining = current.filter(
            (item) => item.geofence_number !== nextGeofence.geofenceNumber
          );

          const newGeofence: Geofence = {
            id: crypto.randomUUID(), // local temporary id
            imei: imei,
            geofence_number: nextGeofence.geofenceNumber,
            geofence_id: nextGeofence.geofenceId,
            created_at: new Date().toISOString(),
            coordinates: nextGeofence.coordinates,
          };

          return [...remaining, newGeofence];
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
    []
  );

  /* ---------------------------------------------- */
  /* Remove geofence locally                        */
  /* ---------------------------------------------- */

  const removeGeofenceLocally = useCallback((geofenceNumber: string) => {
    setGeofences((current) =>
      current.filter((item) => item.geofence_number !== geofenceNumber)
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

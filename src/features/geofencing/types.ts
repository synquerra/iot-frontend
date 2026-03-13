import type { LatLngTuple } from "leaflet";

export type ActiveGeofence = {
  id: string;
  label: string;
  imei: string;
  color: string;
  coordinates: LatLngTuple[];
  createdAt: string;
};

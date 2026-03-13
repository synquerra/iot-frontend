import type { LatLngTuple } from "leaflet";

import type { GeofenceCommandRecord } from "./hooks/useGeofenceCommand";

export function toLatLngTuple(
  coordinates: GeofenceCommandRecord["coordinates"],
): LatLngTuple[] {
  return coordinates.map((point) => [point.latitude, point.longitude]);
}

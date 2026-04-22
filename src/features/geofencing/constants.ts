import type { LatLngTuple } from "leaflet";

export const HARDWARE_SLOTS_COUNT = 3;
export const MAX_VERTICES = 10; // Increased vertex limit for better polygon support
export const DEFAULT_CENTER: LatLngTuple = [23.3441, 85.3096];
export const GEOFENCE_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"] as const;

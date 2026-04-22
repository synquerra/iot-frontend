import { useEffect, useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import { MapContainer, Polygon, TileLayer, useMap, Marker, Tooltip } from "react-leaflet";
import { MousePointer2, Trash2, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CENTER } from "../constants";
import { MapClickHandler } from "./MapClickHandler";
import type { GeofenceCoordinate } from "../types";

type EditorMapProps = {
  activeCoordinates: GeofenceCoordinate[];
  onAddPoint: (point: LatLngTuple) => void;
  onClearPoints: () => void;
  activeColor?: string;
  deviceLocation?: LatLngTuple;
};

function FitGeofences({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export function GeofenceEditorMap({
  activeCoordinates,
  onAddPoint,
  onClearPoints,
  activeColor = "#4f46e5",
  deviceLocation,
}: EditorMapProps) {
  const activePoints: LatLngTuple[] = activeCoordinates.map(c => [c.lat, c.lng]);

  const pointsToFit = useMemo(() => {
    if (activePoints.length > 0) return activePoints;
    return deviceLocation ? [deviceLocation] : [DEFAULT_CENTER];
  }, [activePoints, deviceLocation]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-muted group/editor-map">
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-background/95 backdrop-blur-md p-2 rounded-xl border shadow-xl">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mr-1">
          <MousePointer2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Drawing Mode</span>
        </div>
        <button
          onClick={onClearPoints}
          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
          title="Clear all points"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Point Counter Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
          activePoints.length === 5
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-background/90 text-foreground border-border"
        )}>
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <div 
                key={p} 
                className={cn(
                  "h-2 w-2 rounded-full border border-background",
                  p <= activePoints.length ? (activePoints.length === 5 ? "bg-white" : "bg-primary") : "bg-muted"
                )} 
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {activePoints.length} / 5 Vertices Defined
          </span>
        </div>
      </div>

      <MapContainer
        center={deviceLocation || DEFAULT_CENTER}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler disabled={false} onAddPoint={onAddPoint} />
        <FitGeofences points={pointsToFit} />

        {/* Current Geofence being edited */}
        {activePoints.length > 0 && (
          <Polygon
            positions={activePoints}
            pathOptions={{
              color: activeColor,
              fillColor: activeColor,
              fillOpacity: 0.3,
              weight: 3,
              dashArray: "5, 10"
            }}
          />
        )}

        {/* Individual points (markers) */}
        {activePoints.map((point, idx) => (
          <Marker key={idx} position={point}>
            <Tooltip permanent direction="top" className="bg-primary text-white border-none rounded px-2 py-0.5 text-[9px] font-bold">
              P{idx + 1}
            </Tooltip>
          </Marker>
        ))}

        {/* Device Marker */}
        {deviceLocation && (
          <Marker position={deviceLocation}>
            <Tooltip permanent direction="bottom" className="bg-emerald-600 text-white border-none rounded px-2 py-0.5 text-[9px] font-bold">
              DEVICE
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <Crosshair className="h-20 w-20 text-foreground" />
      </div>
    </div>
  );
}

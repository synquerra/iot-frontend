import { useEffect, useState, useRef, useMemo } from "react";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { MapContainer, Polygon, TileLayer, useMap, Marker, Tooltip } from "react-leaflet";
import {
  MousePointer2,
  Trash2,
  User,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_CENTER } from "../constants";
import { MapClickHandler } from "./MapClickHandler";
import type { GeofenceCoordinate } from "../types";
import { toast } from "sonner";

type MapProps = {
  activeCoordinates: GeofenceCoordinate[];
  onAddPoint: (point: LatLngTuple) => void;
  onClearPoints: () => void;
  otherGeofences: Array<{ geofence_id: number; coordinates: GeofenceCoordinate[]; color?: string }>;
  isEditing: boolean;
  deviceLocation?: LatLngTuple;
  activeColor?: string;
};

function FitGeofences({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

function LocationControls({ deviceLocation }: { deviceLocation?: LatLngTuple }) {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
  }, []);

  const goToDevice = () => {
    if (deviceLocation) {
      map.flyTo(deviceLocation, 16, { duration: 1.5 });
    } else {
      toast.error("Device location not available");
    }
  };

  const goToUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LatLngTuple = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          map.flyTo(loc, 16, { duration: 1.5 });
        },
        (error) => {
          toast.error("Failed to get your location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <>
      <div ref={controlsRef} className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-md hover:bg-primary hover:text-white transition-all duration-300 group"
          onClick={(e) => { e.stopPropagation(); goToDevice(); }}
          title="Locate Device"
        >
          <Smartphone className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg border-2 border-blue-500/20 bg-background/95 backdrop-blur-md hover:bg-blue-600 hover:text-white transition-all duration-300 group"
          onClick={(e) => { e.stopPropagation(); goToUser(); }}
          title="Locate Me"
        >
          <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {userLocation && (
        <Marker position={userLocation}>
          <Tooltip permanent direction="top" className="bg-blue-600 text-white border-none rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
            YOU
          </Tooltip>
        </Marker>
      )}
    </>
  );
}

export function CurrentGeofencesMap({
  activeCoordinates,
  onAddPoint,
  onClearPoints,
  otherGeofences,
  isEditing,
  deviceLocation,
  activeColor = "#4f46e5",
}: MapProps) {
  const activePoints: LatLngTuple[] = activeCoordinates.map(c => [c.lat, c.lng]);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const pointsToFit = useMemo(() => {
    // If we are drawing or have a selected geofence with points, focus on that
    if (activePoints.length > 0) return activePoints;

    // If we are NOT editing, show a global view of all geofences + device
    if (!isEditing) {
      const allPoints: LatLngTuple[] = [];
      otherGeofences.forEach(geo => {
        geo.coordinates.forEach(c => allPoints.push([c.lat, c.lng]));
      });
      if (deviceLocation) allPoints.push(deviceLocation);
      return allPoints;
    }

    // Default to device location if editing but no points yet
    return deviceLocation ? [deviceLocation] : [];
  }, [activePoints, otherGeofences, deviceLocation, isEditing]);

  useEffect(() => {
    if (toolbarRef.current) {
      L.DomEvent.disableClickPropagation(toolbarRef.current);
      L.DomEvent.disableScrollPropagation(toolbarRef.current);
    }
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border shadow-inner bg-muted group/map">
      {/* Map Toolbar */}
      <div ref={toolbarRef} className="absolute top-4 left-4 z-[1000] flex items-center gap-1 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border shadow-lg">
        <ToolbarButton icon={<MousePointer2 className="h-4 w-4" />} active />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          icon={<Trash2 className="h-4 w-4" />}
          className="text-destructive hover:bg-destructive/10"
          onClick={onClearPoints}
        />
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border shadow-md">
          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", deviceLocation ? "bg-emerald-500" : "bg-red-500")} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {deviceLocation ? "Live Telemetry" : "Searching Signal"}
          </span>
        </div>

        {isEditing && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-right-4",
            activePoints.length === 5
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/20"
              : "bg-background/90 text-foreground border-border"
          )}>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
              Geometry: {activePoints.length} / 5 Points
            </span>
          </div>
        )}
      </div>

      <MapContainer
        center={deviceLocation || DEFAULT_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler disabled={!isEditing} onAddPoint={onAddPoint} />
        <FitGeofences points={pointsToFit} />

        <LocationControls deviceLocation={deviceLocation} />

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

        {/* Individual points (markers) for the active geofence */}
        {activePoints.map((point, idx) => (
          <Marker key={idx} position={point} />
        ))}

        {otherGeofences.map((geo) => (
          <Polygon
            key={geo.geofence_id}
            positions={geo.coordinates.map(c => [c.lat, c.lng])}
            pathOptions={{
              color: geo.color || "#64748b",
              fillColor: geo.color || "#64748b",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        ))}

        {/* Device Last Known Location Marker */}
        {deviceLocation && (
          <Marker position={deviceLocation}>
            <Tooltip permanent direction="top" className="bg-primary text-white border-none rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
              UNIT 01
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {!isEditing && activePoints.length === 0 && (
        <div className="absolute inset-0 z-[1001] bg-background/5 flex items-center justify-center pointer-events-none transition-opacity group-hover/map:opacity-0">
          <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border shadow-xl text-xs font-bold text-muted-foreground">
            Select "New Geofence" or an existing one to start drawing
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon,
  active,
  onClick,
  className
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "p-2 rounded-md transition-all",
        active ? "bg-primary text-white shadow-sm" : "hover:bg-muted text-muted-foreground",
        className
      )}
    >
      {icon}
    </button>
  );
}

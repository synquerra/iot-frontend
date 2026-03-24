import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  Battery,
  MapPin,
  Move,
  Wifi,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface MetricsGridProps {
  speed: number;
  latitude: number;
  longitude: number;
  battery: number;
  signal: number;
}

// Custom pulse marker for the minimap
const createMinimapMarker = () => {
  return L.divIcon({
    className: "custom-minimap-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      background: #22c55e;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export function MetricsGrid({
  speed,
  latitude,
  longitude,
  battery,
  signal,
}: MetricsGridProps) {
  const getSignalStrength = (signal: number) => {
    if (signal >= 80) return 4;
    if (signal >= 60) return 3;
    if (signal >= 40) return 2;
    if (signal >= 20) return 1;
    return 0;
  };

  // Determine battery color based on level
  // const getBatteryColorClass = (level: number) => {
  //   if (level > 60) return "bg-green-500";
  //   if (level > 20) return "bg-yellow-500";
  //   return "bg-red-500";
  // };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Move}
        label="Movement"
        value={speed}
        unit="km/h"
        color="blue"
      >
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-mono">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </div>
      </MetricCard>

      <MetricCard
        icon={Battery}
        label="Battery"
        value={battery}
        unit="%"
        color="yellow"
      >
        <div className="mt-4 space-y-2">
          <Progress
            value={battery}
            className={cn(
              "h-2",
              battery > 60
                ? "text-green-500"
                : battery > 20
                  ? "text-yellow-500"
                  : "text-red-500",
            )}
            // The color is applied via the className above, which styles the progress bar
          />
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>≈ 3 hours remaining</span>
            <span className="font-mono">{battery}%</span>
          </p>
        </div>
      </MetricCard>

      <MetricCard
        icon={Wifi}
        label="Signal"
        value={signal}
        unit="%"
        color="purple"
      >
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-6 rounded-full transition-all",
                  i < getSignalStrength(signal) ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      </MetricCard>

      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full min-h-[160px]">
        <CardContent className="p-0 flex-1 relative">
          <MapContainer
            center={[latitude, longitude]}
            zoom={14}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[latitude, longitude]} icon={createMinimapMarker()} />
          </MapContainer>
          <div className="absolute bottom-3 left-3 right-3 bg-background/95 backdrop-blur rounded-lg p-2.5 shadow-sm z-[1000] flex flex-col gap-1 border border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <MapPin className="h-3.5 w-3.5 text-green-500" />
              Live Location
            </div>
            <div className="text-[10px] font-mono text-muted-foreground pl-5 tracking-tighter">
              {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

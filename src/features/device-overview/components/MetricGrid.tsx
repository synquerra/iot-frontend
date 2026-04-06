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
  Thermometer,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface MetricsGridProps {
  speed: number;
  latitude: number;
  longitude: number;
  battery: number;
  signal: number;
  temperature: number;
  geoid?: string | null;
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
  temperature,
  geoid,
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
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

      <MetricCard
        icon={Thermometer}
        label="Temperature"
        value={temperature}
        unit="°C"
        color="orange"
      >
        <div className="mt-4 space-y-2 border-t pt-3">
          <p className="text-xs text-muted-foreground flex justify-between">
             <span>Sensor Temp</span>
             <span className="font-mono">{temperature.toFixed(2)} °C</span>
          </p>
        </div>
      </MetricCard>

      <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-h-[160px] border-border/50 ring-1 ring-border/50">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-md rounded-xl p-2.5 shadow-xl z-[1000] flex flex-col gap-1 border border-white/20">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground">
                <MapPin className="h-3 w-3 text-emerald-500" />
                Smart HUD
              </div>
              <span className="text-[10px] font-mono text-muted-foreground tracking-tighter">
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest py-0.5 px-1.5 bg-muted rounded flex items-center gap-1">
                 <div className="h-1 w-1 rounded-full bg-emerald-500" />
                 LIVE
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all duration-500",
                geoid 
                  ? "bg-primary/20 text-primary" 
                  : "bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              )}>
                {geoid ? `ID: ${geoid}` : "GPS error"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

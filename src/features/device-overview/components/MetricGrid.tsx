import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  Battery,
  Move,
  Wifi,
  Thermometer,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface MetricsGridProps {
  speed: number;
  latitude: number;
  longitude: number;
  battery: number;
  signal: number;
  temperature: number;
  geoid?: string | null;
  lowBatLimit?: number;
  tempLimit?: number;
  name?: string;
  imei?: string;
  lastUpdate?: string;
}

const createMinimapMarker = (color: string = "#4F46E5") => {
  return L.divIcon({
    className: "custom-minimap-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
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
  lowBatLimit = 30,
  tempLimit = 50,
  name,
  // imei,
  // lastUpdate,
}: MetricsGridProps) {
  const lastToastRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastToastRef.current < 30000) return;

    if (temperature > 47) {
      toast.error("Critical Temperature", {
        description: `Device is running at ${temperature.toFixed(2)}°C. Shutdown imminent above ${tempLimit}°C.`,
        duration: 5000,
      });
      lastToastRef.current = now;
    }
  }, [temperature, tempLimit]);

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-stretch">
      {/* 8-column section for stats cards */}
      <div className="lg:col-span-8 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard
          icon={Move}
          label="Movement"
          value={speed}
          unit="km/h"
          color="sky"
        />

        <MetricCard
          icon={Battery}
          label="Battery"
          value={battery}
          unit="%"
          color={battery < lowBatLimit ? "red" : battery > 60 ? "emerald" : "orange"}
        />

        <MetricCard
          icon={Wifi}
          label="Signal"
          value={signal}
          unit="%"
          color={signal < 40 ? "red" : signal <= 70 ? "orange" : "emerald"}
        />

        <MetricCard
          icon={Thermometer}
          label="Hardware"
          value={temperature}
          unit="°C"
          color={temperature > 47 ? "red" : temperature > 43 ? "orange" : "emerald"}
        />
      </div>

      {/* 4-column section for Live Map */}
      <Card className="lg:col-span-4 group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-h-[120px] border-border bg-card rounded-xl">
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
          <div className="absolute inset-0 bg-background/5 pointer-events-none" />
          
          <div className="absolute bottom-3 right-3 z-[1000]">
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl border",
              geoid
                ? "bg-primary text-white border-primary"
                : "bg-red-600 text-white border-red-700 dark:bg-red-500 dark:border-red-600"
            )}>
              {geoid ? `ZONE: ${geoid}` : "NO GEOFENCE"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

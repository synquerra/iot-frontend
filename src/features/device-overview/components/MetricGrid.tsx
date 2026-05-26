import { Card, Box } from "@mantine/core";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Polygon } from "react-leaflet";
import {
  Battery,
  Move,
  Wifi,
  Thermometer,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useEffect, useRef } from "react";
import { toast } from "@/lib/toast";

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
  geofences?: Array<{ geofence_id: string; coordinates: { lat: number; lng: number }[]; color?: string }>;
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
  imei,
  lastUpdate,
  geofences = [],
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
      <div className="lg:col-span-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
      <Card 
        radius="xl"
        withBorder
        padding={0}
        onClick={() => imei && (window.location.href = `/devices/map/${imei}`)}
        className="lg:col-span-4 group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-h-[250px] lg:min-h-[120px] border-border bg-card cursor-pointer hover:border-primary/50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Box className="p-0 flex-1 relative h-full min-h-[120px]">
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
            
            {/* Render Geofences in Minimap */}
            {geofences.map((geo) => (
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

            <Marker position={[latitude, longitude]} icon={createMinimapMarker()} />
          </MapContainer>
          <div className="absolute inset-0 bg-background/5 pointer-events-none group-hover:bg-primary/5 transition-colors" />
          
          <div className="absolute bottom-3 right-3 z-[1000]">
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl border transition-all group-hover:scale-105",
              geoid === "11" 
                ? "bg-amber-600 text-white border-amber-700"
                : (geoid && geoid !== "10")
                  ? "bg-primary text-white border-primary"
                  : "bg-red-600 text-white border-red-700 dark:bg-red-500 dark:border-red-600"
            )}>
              {geoid === "11" ? "GPS DISABLED" : (geoid && geoid !== "10") ? `ZONE: ${geoid}` : "NOT IN GEOFENCE"}
            </span>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
             <span className="bg-white/90 text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform">
               Open Live Map
             </span>
          </div>
        </Box>
      </Card>
    </div>
  );
}

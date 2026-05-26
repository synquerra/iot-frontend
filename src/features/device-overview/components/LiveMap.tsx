import { Badge, ActionIcon, Tooltip } from "@mantine/core";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Compass, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polygon,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";

// Fix for default markers in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createDeviceMarker = (color: string = "#EF4444") => {
  return L.divIcon({
    className: "custom-device-marker",
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      animation: pulse 1.5s ease-in-out infinite;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, map]);
  return null;
};

const ZoomControls = ({ onZoomIn, onZoomOut }: { onZoomIn: () => void, onZoomOut: () => void }) => {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <Tooltip label="Zoom In" position="left">
        <ActionIcon variant="default" size="lg" radius="md" className="bg-background/90 backdrop-blur shadow-lg border-0" onClick={() => { map.zoomIn(); onZoomIn(); }}>
          <ZoomIn size="1.1rem" />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zoom Out" position="left">
        <ActionIcon variant="default" size="lg" radius="md" className="bg-background/90 backdrop-blur shadow-lg border-0" onClick={() => { map.zoomOut(); onZoomOut(); }}>
          <ZoomOut size="1.1rem" />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Reset View" position="left">
        <ActionIcon variant="default" size="lg" radius="md" className="bg-background/90 backdrop-blur shadow-lg border-0" onClick={() => map.setView(map.getCenter(), map.getZoom())}>
          <Compass size="1.1rem" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

const pulseAnimation = `
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
`;

interface LiveMapProps {
  latitude: number;
  longitude: number;
  geoid?: string | null;
  fullScreen?: boolean;
  imei?: string;
  geofences?: Array<{ geofence_id: string; coordinates: { lat: number; lng: number }[]; color?: string }>;
}

export function LiveMap({ latitude, longitude, geoid, fullScreen = false, imei, geofences = [] }: LiveMapProps) {
  const [zoom] = useState(14);
  const navigate = useNavigate();
  const position: [number, number] = [latitude, longitude];

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = pulseAnimation;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div 
      onClick={() => !fullScreen && navigate(`/devices/map/${imei}`)}
      className={cn(
        "relative group/map transition-all duration-500 overflow-hidden",
        fullScreen ? "h-full w-full" : "h-[300px] sm:h-[400px] rounded-2xl border-2 border-border/50 shadow-xl cursor-pointer hover:border-primary/50"
      )}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={fullScreen}
        dragging={fullScreen}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" opacity={0.4} />
        
        {/* Render Geofences */}
        {geofences.map((geo) => (
          <Polygon
            key={geo.geofence_id}
            positions={geo.coordinates.map(c => [c.lat, c.lng])}
            pathOptions={{
              color: geo.color || "#64748b",
              fillColor: geo.color || "#64748b",
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "4, 8"
            }}
          />
        ))}

        <Marker position={position} icon={createDeviceMarker()}>
          <Popup className="premium-popup">
            <div className="p-2 min-w-[150px]">
              <div className={cn("p-2.5 rounded-lg border", 
                geoid === "11" ? "bg-amber-500/5 border-amber-500/20" :
                (geoid && geoid !== "10") ? "bg-blue-500/5 border-blue-500/20" : 
                "bg-red-500/5 border-red-500/20")}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Geofence Status</p>
                <p className={cn("font-mono text-xs font-black", 
                  geoid === "11" ? "text-amber-600" :
                  (geoid && geoid !== "10") ? "text-blue-500" : 
                  "text-red-500")}>
                  {geoid === "11" ? "GPS DISABLED" : (geoid && geoid !== "10") ? `ZONE: ${geoid}` : "NOT IN GEOFENCE"}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>

        <MapController center={position} />
        {fullScreen && <ZoomControls onZoomIn={() => {}} onZoomOut={() => {}} />}
      </MapContainer>

      <div className={cn(
        "absolute z-[1000] pointer-events-none transition-all duration-500 flex items-center gap-3",
        fullScreen ? "bottom-6 left-6" : "bottom-3 left-3 scale-[0.85] origin-bottom-left"
      )}>
        <Badge 
          size="lg"
          variant="outline" 
          className={cn(
            "pointer-events-auto px-4 py-2 rounded-xl backdrop-blur-2xl shadow-2xl font-mono text-xs font-black tracking-widest uppercase transition-all",
            geoid === "11"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : (geoid && geoid !== "10")
                ? "bg-slate-950/90 text-white border-white/10 ring-1 ring-white/10" 
                : "bg-red-500/20 text-red-400 border-red-500/30"
          )}
        >
          {geoid === "11" ? "GPS DISABLED" : (geoid && geoid !== "10") ? `ZONE: ${geoid}` : "NOT IN GEOFENCE"}
        </Badge>
      </div>

      {fullScreen && <div className="absolute inset-0 pointer-events-none border-[12px] border-black/5 z-[1000] shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" />}
    </div>
  );
}

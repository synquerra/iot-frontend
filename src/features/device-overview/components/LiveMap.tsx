import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clock, Compass, Smartphone, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Fix for default markers in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Configure default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker for active device
const createDeviceMarker = (color: string = "#FF0000") => {
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

// Component to handle map centering when coordinates change
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

// Component to handle zoom controls
const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  // onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) => {
  const map = useMapEvents({
    zoomend: () => {
      // You could update zoom level here if needed
    },
  });

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/90 backdrop-blur shadow-lg hover:bg-accent"
            onClick={() => {
              map.zoomIn();
              onZoomIn();
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Zoom In</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/90 backdrop-blur shadow-lg hover:bg-accent"
            onClick={() => {
              map.zoomOut();
              onZoomOut();
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Zoom Out</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/90 backdrop-blur shadow-lg hover:bg-accent"
            onClick={() => {
              map.setView(map.getCenter(), map.getZoom());
            }}
          >
            <Compass className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Reset View</TooltipContent>
      </Tooltip>
    </div>
  );
};

// Add pulse animation to global styles
const pulseAnimation = `
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

import { useNavigate } from "react-router-dom";

interface LiveMapProps {
  latitude: number;
  longitude: number;
  speed: number;
  name: string;
  battery: number;
  lastUpdate: string;
  geoid?: string | null;
  fullScreen?: boolean;
  imei?: string;
}

export function LiveMap({
  latitude,
  longitude,
  speed,
  name,
  battery,
  lastUpdate,
  geoid,
  fullScreen = false,
  imei,
}: LiveMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [zoom, setZoom] = useState(14);
  const markerRef = useRef<L.Marker | null>(null);
  const navigate = useNavigate();

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid Date";
    }
  };

  const position: [number, number] = [latitude, longitude];

  // Add animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = pulseAnimation;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const MapContent = (
    <div 
      onClick={() => !fullScreen && navigate(`/devices/map/${imei}`)}
      className={cn(
        "relative group/map transition-all duration-500",
        fullScreen ? "h-full w-full" : "h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-border/50 shadow-xl cursor-pointer hover:border-primary/50"
      )}
    >
      <div className="w-full h-full relative z-0">
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={fullScreen}
          dragging={fullScreen}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          whenReady={() => setMap(map)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            opacity={0.4}
          />

          <Marker
            position={position}
            icon={createDeviceMarker("#EF4444")}
            ref={markerRef}
          >
            <Popup className="premium-popup">
              <div className="p-3 min-w-[220px] bg-background">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                     <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-black text-base uppercase tracking-tight">{name}</h3>
                </div>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>VELOCITY</span>
                    <span className="text-foreground">{speed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>ENERGY</span>
                    <span className={cn(
                      "text-foreground",
                      battery < 20 ? "text-red-500" : "text-emerald-500"
                    )}>{battery}%</span>
                  </div>

                  <div className="pt-2 border-t mt-2">
                     <p className="text-[10px] text-muted-foreground uppercase mb-1">Coordinates</p>
                     <p className="font-mono text-foreground flex justify-between gap-1 items-center bg-muted/30 p-1.5 rounded">
                       <span>{latitude.toFixed(6)}°N</span>
                       <span className="opacity-30">/</span>
                       <span>{longitude.toFixed(6)}°E</span>
                     </p>
                  </div>

                  <div className={cn(
                    "mt-2 p-2 rounded-lg text-center transition-all",
                    geoid ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  )}>
                     {geoid ? `TARGET ID: ${geoid}` : "LINK FAILURE (GPS ERROR)"}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>

          <MapController center={position} />

          {map && fullScreen && (
            <ZoomControls
              onZoomIn={() => setZoom(map.getZoom())}
              onZoomOut={() => setZoom(map.getZoom())}
              onReset={() => map.setView(position, zoom)}
            />
          )}
        </MapContainer>
        
        {fullScreen && <div className="absolute inset-0 pointer-events-none border-[12px] border-black/5 z-[1000] rounded-none shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" />}
      </div>

      {/* Cinematic HUD Overlay */}
      <div className={cn(
        "absolute z-[1000] flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none transition-all duration-500",
        fullScreen ? "bottom-6 left-6 right-6" : "bottom-3 left-3 right-3 scale-[0.85] origin-bottom-left"
      )}>
        <Card className="bg-slate-950/80 backdrop-blur-xl shadow-2xl border-white/10 w-full md:w-96 pointer-events-auto ring-1 ring-white/10">
          <CardContent className={cn("p-5", !fullScreen && "p-4")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Data Matrix</span>
                    <span className="text-white text-lg font-bold tracking-tight">Active Link</span>
                 </div>
                 {!fullScreen ? (
                    <Button 
                      size="sm" 
                      className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 font-black text-[10px] h-7 gap-2 px-3"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      EXPAND INTEL
                    </Button>
                 ) : (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse font-black text-[10px]">
                      SECURE
                    </Badge>
                 )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Latitude</p>
                  <p className="font-mono text-white text-sm font-bold bg-white/5 py-1 px-2 rounded leading-none">
                    {latitude.toFixed(6)}°
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Longitude</p>
                  <p className="font-mono text-white text-sm font-bold bg-white/5 py-1 px-2 rounded leading-none">
                    {longitude.toFixed(6)}°
                  </p>
                </div>
              </div>

              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all",
                geoid 
                  ? "bg-white/5 border border-white/10" 
                  : "bg-red-500/20 border border-red-500/30"
              )}>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Global Identifier</span>
                  <span className={cn("font-mono text-sm font-black", !geoid ? "text-red-400" : "text-white")}>
                    {geoid || "ERROR: NO LOCK"}
                  </span>
                </div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  geoid ? "bg-primary/20 border-primary/30 text-primary" : "bg-red-500/20 border-red-500/30 text-red-400"
                )}>
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {fullScreen && (
          <div className="hidden md:flex flex-col gap-2 pointer-events-auto">
             <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-3 ring-1 ring-white/10">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <Clock className="h-5 w-5 text-white/60" />
                </div>
                <div className="flex flex-col pr-4">
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Last Intel</span>
                   <span className="text-white text-sm font-bold font-mono">{formatDateTime(lastUpdate)}</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  return MapContent;
}

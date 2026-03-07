import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Compass, Navigation, Satellite, ZoomIn, ZoomOut } from "lucide-react";
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
            className="h-8 w-8 bg-white/90 backdrop-blur shadow-lg hover:bg-white"
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
            className="h-8 w-8 bg-white/90 backdrop-blur shadow-lg hover:bg-white"
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
            className="h-8 w-8 bg-white/90 backdrop-blur shadow-lg hover:bg-white"
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

interface LiveMapProps {
  latitude: number;
  longitude: number;
  speed: number;
  satellites: number;
  name: string;
  battery: number;
  lastUpdate: string;
}

export function LiveMap({
  latitude,
  longitude,
  speed,
  satellites,
  name,
  battery,
  lastUpdate,
}: LiveMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [zoom, setZoom] = useState(14);
  const markerRef = useRef<L.Marker | null>(null);

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Location Tracking</CardTitle>
            <CardDescription>Real-time device position on map</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Satellite className="h-3 w-3" />
              {satellites} satellites
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Navigation className="h-3 w-3" />
              {speed} km/h
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="w-full h-[500px] bg-slate-200 dark:bg-slate-800 relative">
          <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            whenReady={() => setMap(map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Optional: Add satellite view as overlay */}
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              opacity={0.5}
            />

            <Marker
              position={position}
              icon={createDeviceMarker("#FF0000")}
              ref={markerRef}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{name}</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Speed:</span> {speed} km/h
                    </p>
                    <p>
                      <span className="font-medium">Battery:</span> {battery}%
                    </p>
                    <p>
                      <span className="font-medium">Satellites:</span>{" "}
                      {satellites}
                    </p>
                    <p>
                      <span className="font-medium">Last update:</span>{" "}
                      {formatDateTime(lastUpdate)}
                    </p>
                    <p>
                      <span className="font-medium">Coordinates:</span>
                    </p>
                    <p className="text-xs font-mono">
                      {latitude.toFixed(6)}°N, {longitude.toFixed(6)}°E
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>

            <MapController center={position} />

            {map && (
              <ZoomControls
                onZoomIn={() => setZoom(map.getZoom())}
                onZoomOut={() => setZoom(map.getZoom())}
                onReset={() => map.setView(position, zoom)}
              />
            )}
          </MapContainer>
        </div>

        {/* Location Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 z-[1000]">
          <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Location</span>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono font-medium">
                      {latitude.toFixed(6)}°N
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono font-medium">
                      {longitude.toFixed(6)}°E
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-medium">±5 meters</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Update</p>
                    <p className="font-medium">{formatDateTime(lastUpdate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

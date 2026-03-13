import type { LatLngTuple } from "leaflet";
import { MapContainer, Marker, Polygon, Polyline, TileLayer } from "react-leaflet";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ActiveGeofence } from "../types";
import { DEFAULT_CENTER } from "../constants";
import { MapClickHandler } from "./MapClickHandler";

type GeofenceMapEditorProps = {
  selectedImei: string;
  draftVertices: LatLngTuple[];
  activeDeviceGeofences: ActiveGeofence[];
  onAddDraftVertex: (point: LatLngTuple) => void;
};

export function GeofenceMapEditor({
  selectedImei,
  draftVertices,
  activeDeviceGeofences,
  onAddDraftVertex,
}: GeofenceMapEditorProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Map Editor</CardTitle>
        <CardDescription>
          Click the map to place polygon points. The draft turns into a saved
          geofence when you use Save.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[680px] w-full bg-slate-100">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              disabled={!selectedImei}
              onAddPoint={onAddDraftVertex}
            />

            {draftVertices.map((point, index) => (
              <Marker key={`${point[0]}-${point[1]}-${index}`} position={point} />
            ))}

            {draftVertices.length === 2 && (
              <Polyline
                positions={draftVertices}
                pathOptions={{
                  color: "#f59e0b",
                  dashArray: "6 6",
                }}
              />
            )}

            {draftVertices.length >= 3 && (
              <Polygon
                positions={draftVertices}
                pathOptions={{
                  color: "#f59e0b",
                  fillColor: "#fbbf24",
                  fillOpacity: 0.2,
                  dashArray: "6 6",
                }}
              />
            )}

            {activeDeviceGeofences.map((geofence) => (
              <Polygon
                key={geofence.id}
                positions={geofence.vertices}
                pathOptions={{
                  color: geofence.color,
                  fillColor: geofence.color,
                  fillOpacity: 0.18,
                }}
              />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

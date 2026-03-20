import { useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_CENTER } from "../constants";
import type { ActiveGeofence } from "../types";

type CurrentGeofencesMapProps = {
  selectedImei: string;
  geofences: ActiveGeofence[];
};

function FitGeofences({ geofences }: { geofences: ActiveGeofence[] }) {
  const map = useMap();

  useEffect(() => {
    const allPoints = geofences.flatMap((geofence) => geofence.coordinates);

    if (allPoints.length === 0) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }

    map.fitBounds(allPoints, {
      padding: [32, 32],
    });
  }, [geofences, map]);

  return null;
}

function GeofenceLabels({ geofences }: { geofences: ActiveGeofence[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {geofences.map((geofence) => (
        <div
          key={geofence.id}
          className="flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1 text-xs shadow-sm"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: geofence.color }}
          />
          <span>{geofence.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CurrentGeofencesMap({
  selectedImei,
  geofences,
}: CurrentGeofencesMapProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Current Geofences Map</CardTitle>
        <CardDescription>
          {selectedImei
            ? `Live view of saved geofences for device ${selectedImei}.`
            : "Select a device to preview its saved geofences on the map."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0 z-0">
        <div className="h-[720px] w-full bg-slate-100 dark:bg-slate-900">
          <MapContainer
            center={DEFAULT_CENTER as LatLngTuple}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitGeofences geofences={geofences} />

            {geofences.map((geofence) => (
              <Polygon
                key={geofence.id}
                positions={geofence.coordinates}
                pathOptions={{
                  color: geofence.color,
                  fillColor: geofence.color,
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
            ))}
          </MapContainer>
        </div>

        {geofences.length > 0 ? (
          <div className="px-6 pb-6">
            <GeofenceLabels geofences={geofences} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

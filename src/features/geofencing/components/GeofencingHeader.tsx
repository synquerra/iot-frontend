import { LocateFixed, MapPinned } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type GeofencingHeaderProps = {
  geofenceCount: number;
  draftVertexCount?: number;
  maxGeofences: number;
  maxVertices: number;
};

export function GeofencingHeader({
  geofenceCount,
  draftVertexCount,
  maxGeofences,
  maxVertices,
}: GeofencingHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Geofencing</h1>
        <p className="text-muted-foreground">
          Draw polygon geofences on the map. Each device supports up to{" "}
          {maxGeofences} geofences with {maxVertices} vertices each.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <MapPinned className="h-3.5 w-3.5" />
          {geofenceCount}/{maxGeofences} geofences
        </Badge>
        {draftVertexCount !== undefined ? (
          <Badge variant="outline" className="gap-1">
            <LocateFixed className="h-3.5 w-3.5" />
            {draftVertexCount}/{maxVertices} draft vertices
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

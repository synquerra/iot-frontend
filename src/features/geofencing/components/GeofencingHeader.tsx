import { LocateFixed, MapPinned } from "lucide-react";
import { Badge, Group, Text } from "@mantine/core";

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
        <Text size="sm" className="text-muted-foreground">
          Draw polygon geofences on the map. Each device supports up to{" "}
          {maxGeofences} geofences with {maxVertices} vertices each.
        </Text>
      </div>
      <Group gap="xs" className="flex-wrap">
        <Badge variant="outline" color="gray" className="gap-1 px-2.5 py-1.5 h-auto text-xs normal-case">
          <span className="flex items-center gap-1">
            <MapPinned className="h-3.5 w-3.5" />
            {geofenceCount}/{maxGeofences} geofences
          </span>
        </Badge>
        {draftVertexCount !== undefined ? (
          <Badge variant="outline" color="gray" className="gap-1 px-2.5 py-1.5 h-auto text-xs normal-case">
            <span className="flex items-center gap-1">
              <LocateFixed className="h-3.5 w-3.5" />
              {draftVertexCount}/{maxVertices} draft vertices
            </span>
          </Badge>
        ) : null}
      </Group>
    </div>
  );
}

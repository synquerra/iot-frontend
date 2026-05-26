import { Plus, Trash2 } from "lucide-react";
import { Card, Button, Badge, Group, Text, Box, ActionIcon } from "@mantine/core";
import type { Geofence } from "@/types";

type SavedGeofencesCardProps = {
  selectedImei: string;
  geofences: Geofence[];
  canAddGeofence: boolean;
  isAddingDisabled: boolean;
  onAddGeofence: () => void;
  onRemoveGeofence: (geofenceNumber: string) => void;
  focusedGeofenceId?: string | null;
  onGeofenceClick?: (geofenceNumber: string) => void;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
};

export function SavedGeofencesCard({
  selectedImei,
  geofences,
  canAddGeofence,
  isAddingDisabled,
  onAddGeofence,
  onRemoveGeofence,
  focusedGeofenceId,
  onGeofenceClick,
}: SavedGeofencesCardProps) {

  return (
    <Card className="p-0 border-border">
      <Group justify="space-between" align="start" className="p-4 gap-4 border-b border-border">
        <div className="space-y-1">
          <Text size="sm" fw={700} className="text-foreground">Saved Geofences</Text>
          <Text size="xs" className="text-muted-foreground">
            {selectedImei
              ? `Showing geofences for device ${selectedImei}`
              : "Select a device to view its geofences"}
          </Text>
        </div>
        <Button
          onClick={onAddGeofence}
          disabled={isAddingDisabled}
          className="gap-2 sm:self-start text-white font-bold text-xs"
          color="blue"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Geofence
        </Button>
      </Group>

      <Box className="p-4 space-y-3">
        {geofences.length === 0 ? (
          <Text size="sm" className="text-muted-foreground">
            No geofences found.
          </Text>
        ) : (
          geofences.map((geofence) => {
            const coords = geofence?.coordinates ?? [];

            const first = coords.length > 0 ? coords[0] : null;
            const last = coords.length > 0 ? coords[coords.length - 1] : null;

            const geofenceId = String(geofence.id ?? geofence.geofence_number);
            return (
              <Card
                key={geofenceId}
                withBorder
                radius="md"
                padding="md"
                onClick={() => onGeofenceClick?.(geofenceId)}
                className={`flex flex-row items-start justify-between cursor-pointer transition-all duration-150 hover:border-primary/50 hover:bg-muted/50 ${
                  focusedGeofenceId === geofenceId 
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm" 
                    : "border-border"
                }`}
              >
                <div className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="outline">{geofence.geofence_number}</Badge>
                    <Badge variant="light" color="blue">{geofence.geofence_id}</Badge>
                  </div>

                  <div>Points: {coords.length}</div>

                  {first && (
                    <div className="text-xs text-muted-foreground">
                      First: {first.latitude?.toFixed(4)}, {first.longitude?.toFixed(4)}
                    </div>
                  )}

                  {last && (
                    <div className="text-xs text-muted-foreground">
                      Last: {last.latitude?.toFixed(4)}, {last.longitude?.toFixed(4)}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(geofence.created_at)}
                  </div>
                </div>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGeofence(geofence.geofence_number);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </ActionIcon>
              </Card>
            );
          })
        )}
        {!canAddGeofence && selectedImei ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This device already has the maximum number of geofences.
          </div>
        ) : null}
      </Box>
    </Card>
  );
}

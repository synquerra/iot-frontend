import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Saved Geofences</CardTitle>
          <CardDescription>
            {selectedImei
              ? `Showing geofences for device ${selectedImei}`
              : "Select a device to view its geofences"}
          </CardDescription>
        </div>
        <Button
          onClick={onAddGeofence}
          disabled={isAddingDisabled}
          className="gap-2 sm:self-start"
        >
          <Plus className="h-4 w-4" />
          Add Geofence
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {geofences.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No geofences found.
          </div>
        ) : (
          geofences.map((geofence) => {
            const coords = geofence?.coordinates ?? [];

            const first = coords.length > 0 ? coords[0] : null;
            const last = coords.length > 0 ? coords[coords.length - 1] : null;

            const geofenceId = String(geofence.id ?? geofence.geofence_number);
            return (
              <div
                key={geofenceId}
                onClick={() => onGeofenceClick?.(geofenceId)}
                className={`flex items-start justify-between rounded-lg border p-4 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50 ${
                  focusedGeofenceId === geofenceId 
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm" 
                    : ""
                }`}
              >
                <div className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="outline">{geofence.geofence_number}</Badge>
                    <Badge variant="secondary">{geofence.geofence_id}</Badge>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGeofence(geofence.geofence_number);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
        {!canAddGeofence && selectedImei ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This device already has the maximum number of geofences.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

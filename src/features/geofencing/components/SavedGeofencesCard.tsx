import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ActiveGeofence } from "../types";

type SavedGeofencesCardProps = {
  selectedImei: string;
  geofences: ActiveGeofence[];
  onRemoveGeofence: (id: string) => void;
};

export function SavedGeofencesCard({
  selectedImei,
  geofences,
  onRemoveGeofence,
}: SavedGeofencesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Geofences</CardTitle>
        <CardDescription>
          {selectedImei
            ? "Saved polygons for the current device."
            : "Choose a device to view its saved polygons."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {geofences.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No geofences added yet.
          </div>
        ) : (
          geofences.map((geofence) => (
            <div
              key={geofence.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: geofence.color }}
                  />
                  <span className="font-medium">{geofence.label}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {geofence.vertices.length} vertices
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveGeofence(geofence.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

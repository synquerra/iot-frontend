import { RotateCcw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DraftControlsCardProps = {
  selectedImei: string;
  draftVertexCount: number;
  canAddMoreGeofences: boolean;
  isSaving: boolean;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
};

export function DraftControlsCard({
  selectedImei,
  draftVertexCount,
  canAddMoreGeofences,
  isSaving,
  onUndo,
  onClear,
  onSave,
}: DraftControlsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Controls</CardTitle>
        <CardDescription>
          Click on the map to add points. Save once the polygon has at least three
          vertices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onUndo}
            disabled={draftVertexCount === 0}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            disabled={draftVertexCount === 0}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <Button
          onClick={onSave}
          disabled={
            !selectedImei || draftVertexCount < 3 || !canAddMoreGeofences || isSaving
          }
          className="w-full gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Geofence"}
        </Button>

      </CardContent>
    </Card>
  );
}

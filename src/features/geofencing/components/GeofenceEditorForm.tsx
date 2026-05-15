import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeofenceRecord } from "../types";

interface GeofenceEditorFormProps {
  geofence: GeofenceRecord | null;
  onChange: (updates: Partial<GeofenceRecord>) => void;
}

export function GeofenceEditorForm({
  geofence,
  onChange,
}: GeofenceEditorFormProps) {
  const [formData, setFormData] = useState<Partial<GeofenceRecord>>({});

  useEffect(() => {
    if (geofence) {
      setFormData(geofence);
    }
  }, [geofence]);

  const handleChange = (key: keyof GeofenceRecord, value: any) => {
    const updates = { ...formData, [key]: value };
    setFormData(updates);
    onChange(updates);
  };

  if (!geofence) return null;

  return (
    <div className="space-y-6">
      {/* Section: Basic Info */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Geofence Name
          </Label>
          <Input
            placeholder="Enter geofence name"
            className="h-9 text-sm border-border bg-muted/20 focus:bg-background transition-colors"
            value={formData.geofence_name || ""}
            onChange={(e) => handleChange("geofence_name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Display Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              className="h-9 w-12 p-0.5 border-border bg-muted/20 cursor-pointer"
              value={formData.color || "#4f46e5"}
              onChange={(e) => handleChange("color", e.target.value)}
            />
            <Input
              placeholder="#4f46e5"
              className="h-9 text-sm border-border bg-muted/20 font-mono"
              value={formData.color || ""}
              onChange={(e) => handleChange("color", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section: Configuration */}
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Entry Delay (s)
            </Label>
            <Input
              type="number"
              className="h-9 text-sm border-border bg-muted/20"
              value={formData.entry_alert_delay || 0}
              onChange={(e) => handleChange("entry_alert_delay", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Exit Delay (s)
            </Label>
            <Input
              type="number"
              className="h-9 text-sm border-border bg-muted/20"
              value={formData.exit_alert_delay || 0}
              onChange={(e) => handleChange("exit_alert_delay", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { TextInput, Text } from "@mantine/core";
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
  const [localCoords, setLocalCoords] = useState<{ lat: string; lng: string }[]>(
    Array.from({ length: 5 }, () => ({ lat: "", lng: "" }))
  );

  useEffect(() => {
    if (geofence) {
      setFormData(geofence);
      const coords = geofence.coordinates || [];
      setLocalCoords((current) =>
        Array.from({ length: 5 }, (_, i) => {
          const c = coords[i];
          return {
            lat: c ? c.lat.toString() : current[i]?.lat || "",
            lng: c ? c.lng.toString() : current[i]?.lng || "",
          };
        })
      );
    }
  }, [geofence]);

  const handleChange = (key: keyof GeofenceRecord, value: any) => {
    const updates = { ...formData, [key]: value };
    setFormData(updates);
    onChange(updates);
  };

  const handleCoordChange = (index: number, field: "lat" | "lng", val: string) => {
    const newLocal = [...localCoords];
    newLocal[index] = {
      ...newLocal[index],
      [field]: val
    };
    setLocalCoords(newLocal);

    const parsed = newLocal
      .map((c) => ({
        lat: parseFloat(c.lat),
        lng: parseFloat(c.lng),
      }))
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lng));

    handleChange("coordinates", parsed);
  };

  if (!geofence) return null;

  return (
    <div className="space-y-6">
      {/* Section: Basic Info */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Text size="xs" fw={700} tt="uppercase" className="tracking-widest text-muted-foreground">
            Geofence Name
          </Text>
          <TextInput
            placeholder="Enter geofence name"
            styles={{ input: { height: '2.25rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem' } }}
            value={formData.geofence_name || ""}
            onChange={(e) => handleChange("geofence_name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Text size="xs" fw={700} tt="uppercase" className="tracking-widest text-muted-foreground">
            Display Color
          </Text>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-9 w-12 p-0.5 border border-border/85 bg-muted/20 cursor-pointer rounded-lg focus:outline-none"
              value={formData.color || "#4f46e5"}
              onChange={(e) => handleChange("color", e.target.value)}
            />
            <TextInput
              placeholder="#4f46e5"
              styles={{ input: { height: '2.25rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem', fontFamily: 'monospace' } }}
              className="flex-1"
              value={formData.color || ""}
              onChange={(e) => handleChange("color", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section: 5-Point Coordinates */}
      <div className="space-y-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between px-0.5">
          <Text size="xs" fw={900} tt="uppercase" className="tracking-widest text-foreground/80">
            Coordinates (5-Point Polygon)
          </Text>
          <Text size="0.55rem" fw={700} className="text-muted-foreground/50 uppercase tracking-wider">
            Map click or Type
          </Text>
        </div>

        <div className="space-y-2">
          {localCoords.map((c, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-sm group hover:border-primary/40 transition-all duration-200">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase shrink-0">
                P{i + 1}
              </span>
              <div className="grid grid-cols-2 gap-2 flex-1">
                <TextInput
                  type="text"
                  placeholder="Latitude"
                  styles={{ input: { height: '2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: '0.375rem', fontFamily: 'monospace' } }}
                  value={c.lat}
                  onChange={(e) => handleCoordChange(i, "lat", e.target.value)}
                />
                <TextInput
                  type="text"
                  placeholder="Longitude"
                  styles={{ input: { height: '2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: '0.375rem', fontFamily: 'monospace' } }}
                  value={c.lng}
                  onChange={(e) => handleCoordChange(i, "lng", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Configuration */}
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Text size="xs" fw={700} tt="uppercase" className="tracking-widest text-muted-foreground">
              Entry Delay (s)
            </Text>
            <TextInput
              type="number"
              styles={{ input: { height: '2.25rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem' } }}
              value={formData.entry_alert_delay || 0}
              onChange={(e) => handleChange("entry_alert_delay", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Text size="xs" fw={700} tt="uppercase" className="tracking-widest text-muted-foreground">
              Exit Delay (s)
            </Text>
            <TextInput
              type="number"
              styles={{ input: { height: '2.25rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem' } }}
              value={formData.exit_alert_delay || 0}
              onChange={(e) => handleChange("exit_alert_delay", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { LocateFixed, RotateCcw, Save, Trash2 } from "lucide-react";
import { MapContainer, Marker, Polygon, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_CENTER } from "../constants";
import type { ActiveGeofence } from "../types";
import type { GeofencePayload } from "../hooks/useGeofenceCommand";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const defaultMarker = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultMarker;

type AddGeofenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImei: string;
  activeDeviceGeofences: ActiveGeofence[];
  canAddMoreGeofences: boolean;
  isSaving: boolean;
  maxGeofences: number;
  maxVertices: number;
  onSaveGeofence: (imei: string, payload: GeofencePayload) => Promise<unknown>;
};

function MapClickHandler({
  disabled,
  onAddPoint,
}: {
  disabled: boolean;
  onAddPoint: (point: LatLngTuple) => void;
}) {
  useMapEvents({
    click(event) {
      if (disabled) {
        return;
      }

      onAddPoint([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map]);

  return null;
}

export function AddGeofenceDialog({
  open,
  onOpenChange,
  selectedImei,
  activeDeviceGeofences,
  canAddMoreGeofences,
  isSaving,
  maxGeofences,
  maxVertices,
  onSaveGeofence,
}: AddGeofenceDialogProps) {
  const [draftVertices, setDraftVertices] = useState<LatLngTuple[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftNumber, setDraftNumber] = useState("");

  useEffect(() => {
    if (!open) {
      setDraftVertices([]);
      setDraftName("");
    }
  }, [open]);

  const addDraftVertex = (point: LatLngTuple) => {
    if (!selectedImei) {
      toast.error("Select a device before adding a geofence.");
      return;
    }

    if (!canAddMoreGeofences) {
      toast.error(`You can only create ${maxGeofences} geofences per device.`);
      return;
    }

    setDraftVertices((current) => {
      if (current.length >= maxVertices) {
        toast.error(`A geofence can have at most ${maxVertices} vertices.`);
        return current;
      }

      return [...current, point];
    });
  };

  const clearDraft = () => {
    setDraftVertices([]);
  };

  const undoLastVertex = () => {
    setDraftVertices((current) => current.slice(0, -1));
  };

  const saveDraft = async () => {
    if (!selectedImei) {
      toast.error("Select a device before saving.");
      return;
    }

    if (draftName.trim() === "") {
      toast.error("Please enter a geofence name.");
      return;
    }

    if (draftVertices.length < 3) {
      toast.error("A geofence needs at least 3 vertices.");
      return;
    }

    if (!canAddMoreGeofences) {
      toast.error(`You can only create ${maxGeofences} geofences per device.`);
      return;
    }

    const nextIndex = activeDeviceGeofences.length;

    try {
      await onSaveGeofence(selectedImei, {
        geofence_number: draftNumber || `GEO${nextIndex + 1}`,
        geofence_id: draftName.trim(),
        coordinates: draftVertices.map(([lat, lng]) => ({
          lat,
          lng,
        })),
      });

      onOpenChange(false);
      toast.success(`Geofence ${nextIndex + 1} saved for device ${selectedImei}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save geofence";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-6xl z-[999]">
        <div className="flex h-full max-h-[90vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Add Geofencing</DialogTitle>
            <DialogDescription>
              Click on the map to create a polygon for device {selectedImei}. Save
              once the shape has at least three vertices.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Create Geofence</CardTitle>
                  <Badge variant={draftVertices.length >= 3 ? "default" : "secondary"}>
                    {draftVertices.length}/{maxVertices} points
                  </Badge>
                </div>
                <CardDescription>
                  Name the location, place up to {maxVertices} points, then save the
                  polygon.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="text-muted-foreground">Target device</div>
                  <div className="mt-1 font-mono">{selectedImei || "No device selected"}</div>
                </div>
                <Select value={draftNumber} onValueChange={(value) => setDraftNumber(value)} disabled={!selectedImei || isSaving}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="GEO FENCE" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectGroup>
                      <SelectItem value="GEO1">Geofence 1</SelectItem>
                      <SelectItem value="GEO2">Geofence 2</SelectItem>
                      <SelectItem value="GEO3">Geofence 3</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Label htmlFor="geofence-name">Geofence Name</Label>
                  <Input
                    id="geofence-name"
                    placeholder="Enter location name"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    disabled={!selectedImei || isSaving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={undoLastVertex}
                    disabled={draftVertices.length === 0 || isSaving}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearDraft}
                    disabled={draftVertices.length === 0 || isSaving}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                <Button
                  onClick={saveDraft}
                  disabled={
                    !selectedImei ||
                    draftName.trim() === "" ||
                    draftVertices.length < 3 ||
                    !canAddMoreGeofences ||
                    isSaving
                  }
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Geofence"}
                </Button>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <LocateFixed className="h-3.5 w-3.5" />
                    {activeDeviceGeofences.length}/{maxGeofences} geofences
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Map Editor</CardTitle>
                <CardDescription>
                  Click the map to place polygon points. Saved geofences remain
                  visible for reference while you draw.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[55vh] min-h-[420px] w-full bg-slate-100 dark:bg-slate-900">
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
                      onAddPoint={addDraftVertex}
                    />
                    <MapResizeHandler />

                    {draftVertices.map((point, index) => (
                      <Marker
                        key={`${point[0]}-${point[1]}-${index}`}
                        position={point}
                      />
                    ))}

                    {draftVertices.length === 2 ? (
                      <Polyline
                        positions={draftVertices}
                        pathOptions={{
                          color: "#f59e0b",
                          dashArray: "6 6",
                        }}
                      />
                    ) : null}

                    {draftVertices.length >= 3 ? (
                      <Polygon
                        positions={draftVertices}
                        pathOptions={{
                          color: "#f59e0b",
                          fillColor: "#fbbf24",
                          fillOpacity: 0.2,
                          dashArray: "6 6",
                        }}
                      />
                    ) : null}

                    {activeDeviceGeofences.map((geofence) => (
                      <Polygon
                        key={geofence.id}
                        positions={geofence.coordinates}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { RotateCcw, Save, Trash2 } from "lucide-react";
import { MapContainer, Marker, Polygon, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "@/lib/toast";
import { Button, Card, Select, Badge, Modal, Group, Text, Box } from "@mantine/core";
import { DEFAULT_CENTER } from "../constants";
import type { ActiveGeofence } from "../types";
import type { GeofencePayload } from "../hooks/useGeofenceCommand";
import { getDeviceCommandToastContent } from "@/helpers/deviceCommandHelper";
import type {
  DeviceCommandResponse,
  PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";

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
  onSaveGeofence: (
    imei: string,
    payload: GeofencePayload,
  ) => Promise<DeviceCommandResponse<PublishedDeviceCommandResult>>;
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
  const [localCoords, setLocalCoords] = useState<{ lat: string; lng: string }[]>(
    Array.from({ length: 5 }, () => ({ lat: "", lng: "" }))
  );

  useEffect(() => {
    if (!open) {
      setDraftVertices([]);
      setDraftName("");
      setLocalCoords(Array.from({ length: 5 }, () => ({ lat: "", lng: "" })));
    }
  }, [open]);

  useEffect(() => {
    setLocalCoords((current) =>
      Array.from({ length: 5 }, (_, i) => {
        const v = draftVertices[i];
        return {
          lat: v ? v[0].toString() : current[i]?.lat || "",
          lng: v ? v[1].toString() : current[i]?.lng || "",
        };
      })
    );
  }, [draftVertices]);

  const handleLocalCoordChange = (index: number, field: "lat" | "lng", val: string) => {
    const newLocal = [...localCoords];
    newLocal[index] = {
      ...newLocal[index],
      [field]: val
    };
    setLocalCoords(newLocal);

    const validPoints: LatLngTuple[] = [];
    for (const item of newLocal) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        validPoints.push([lat, lng]);
      }
    }
    setDraftVertices(validPoints);
  };

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
    setLocalCoords(Array.from({ length: 5 }, () => ({ lat: "", lng: "" })));
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
      const response = await onSaveGeofence(selectedImei, {
        geofence_number: draftNumber || `GEO${nextIndex + 1}`,
        geofence_id: draftName.trim(),
        coordinates: draftVertices.map(([lat, lng]) => ({
          lat,
          lng,
        })),
      });

      onOpenChange(false);
      const toastContent = getDeviceCommandToastContent(response);
      toast.success(toastContent.title, {
        description: toastContent.description,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save geofence";
      toast.error(message);
    }
  };

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      size="1200px"
      radius="lg"
      title={
        <div>
          <Text size="md" fw={700} className="text-foreground">Add Geofencing</Text>
          <Text size="xs" className="text-muted-foreground">
            Click on the map to create a polygon for device {selectedImei}. Save
            once the shape has at least three vertices.
          </Text>
        </div>
      }
    >
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-0 border-border">
          <Group justify="space-between" align="center" className="p-4 border-b border-border">
            <Text size="sm" fw={700} className="text-foreground">Create Geofence</Text>
            <Badge color={draftVertices.length >= 3 ? "blue" : "gray"}>
              {draftVertices.length}/{maxVertices} points
            </Badge>
          </Group>
          <Box className="p-4 space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <Text size="xs" className="text-muted-foreground">Target device</Text>
              <div className="mt-1 font-mono text-xs font-bold">{selectedImei || "No device selected"}</div>
            </div>
            
            <Select
              value={draftNumber}
              onChange={(value) => setDraftNumber(value || "")}
              disabled={!selectedImei || isSaving}
              placeholder="GEO FENCE"
              data={[
                { value: "GEO1", label: "Geofence 1" },
                { value: "GEO2", label: "Geofence 2" },
                { value: "GEO3", label: "Geofence 3" },
              ]}
              styles={{ input: { height: '2rem', fontSize: '0.75rem', fontWeight: 700 } }}
            />

            <div className="space-y-2">
              <Text size="xs" fw={700} className="text-foreground">Geofence Name <span className="text-red-500">*</span></Text>
              <input
                placeholder="Enter location name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                disabled={!selectedImei || isSaving}
                className="h-8 text-xs bg-background border border-border/80 text-foreground hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all rounded-md px-2 w-full font-semibold"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Text size="0.6rem" fw={900} tt="uppercase" className="text-foreground/80 tracking-widest">
                  Coordinates (5-Point Polygon)
                </Text>
                <Text size="0.55rem" fw={700} tt="uppercase" className="text-muted-foreground/50 tracking-wider">
                  Map Click or Type
                </Text>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {localCoords.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-sm group hover:border-primary/40 transition-all duration-200">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase shrink-0">
                      P{i + 1}
                    </span>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Latitude"
                        className="h-8 text-xs font-bold font-mono bg-background border border-border/80 text-foreground hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all rounded-md px-2 w-full"
                        value={c.lat}
                        onChange={(e) => handleLocalCoordChange(i, "lat", e.target.value)}
                        disabled={!selectedImei || isSaving}
                      />
                      <input
                        type="text"
                        placeholder="Longitude"
                        className="h-8 text-xs font-bold font-mono bg-background border border-border/80 text-foreground hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all rounded-md px-2 w-full"
                        value={c.lng}
                        onChange={(e) => handleLocalCoordChange(i, "lng", e.target.value)}
                        disabled={!selectedImei || isSaving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                color="gray"
                onClick={undoLastVertex}
                disabled={draftVertices.length === 0 || isSaving}
                className="gap-2 text-xs font-bold"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                color="gray"
                onClick={clearDraft}
                disabled={draftVertices.length === 0 || isSaving}
                className="gap-2 text-xs font-bold"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <Button
              onClick={saveDraft}
              color="blue"
              disabled={
                !selectedImei ||
                draftName.trim() === "" ||
                draftVertices.length < 3 ||
                !canAddMoreGeofences ||
                isSaving
              }
              className="w-full gap-2 text-white font-bold text-xs"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save Geofence"}
            </Button>
          </Box>
        </Card>

        <Card className="overflow-hidden p-0 border-border">
          <Group justify="space-between" align="center" className="p-4 border-b border-border">
            <Text size="sm" fw={700} className="text-foreground">Map Editor</Text>
            <Text size="xs" className="text-muted-foreground">Click the map to place polygon points.</Text>
          </Group>
          <Box className="p-0">
            <div className="h-[55vh] min-h-[420px] w-full bg-muted">
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
          </Box>
        </Card>
      </div>
    </Modal>
  );
}

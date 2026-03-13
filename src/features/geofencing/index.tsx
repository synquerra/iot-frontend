import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import L, { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { listDevices, type Device } from "@/features/devices/services/deviceService";
import { DraftControlsCard } from "./components/DraftControlsCard";
import { GeofenceMapEditor } from "./components/GeofenceMapEditor";
import { GeofencingHeader } from "./components/GeofencingHeader";
import { SavedGeofencesCard } from "./components/SavedGeofencesCard";
import { TargetDeviceCard } from "./components/TargetDeviceCard";
import {
  GEOFENCE_COLORS,
  MAX_GEOFENCES,
  MAX_VERTICES,
} from "./constants";
import { useGeofenceCommand } from "./hooks/useGeofenceCommand";
import { toLatLngTuple } from "./utils";

const defaultMarker = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultMarker;

export default function GeofencingPage() {
  const { imei: routeImei } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");
  const [draftVertices, setDraftVertices] = useState<LatLngTuple[]>([]);
  const {
    geofences: remoteGeofences,
    loading: geofenceCommandLoading,
    fetchGeofences,
    setGeofence,
    removeGeofenceLocally,
  } = useGeofenceCommand();

  useEffect(() => {
    setSelectedImei(routeImei ?? "");
    setDraftVertices([]);
  }, [routeImei]);

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const response = await listDevices();
        if (!isMounted) {
          return;
        }
        setDevices(response);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load devices";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingDevices(false);
        }
      }
    };

    loadDevices();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.imei === selectedImei) ?? null,
    [devices, selectedImei],
  );

  const activeDeviceGeofences = useMemo(
    () =>
      remoteGeofences.map((geofence, index) => ({
        id: geofence.geofenceNumber,
        label: geofence.geofenceId,
        imei: selectedImei,
        color: GEOFENCE_COLORS[index % GEOFENCE_COLORS.length],
        vertices: toLatLngTuple(geofence.coordinates),
        createdAt: new Date().toISOString(),
      })),
    [remoteGeofences, selectedImei],
  );

  const canAddMoreGeofences = activeDeviceGeofences.length < MAX_GEOFENCES;

  useEffect(() => {
    if (!selectedImei) {
      return;
    }

    fetchGeofences(selectedImei).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Failed to fetch geofences";
      toast.error(message);
    });
  }, [fetchGeofences, selectedImei]);

  const addDraftVertex = (point: LatLngTuple) => {
    if (!selectedImei) {
      toast.error("Select a device before adding a geofence.");
      return;
    }

    if (!canAddMoreGeofences) {
      toast.error(`You can only create ${MAX_GEOFENCES} geofences per device.`);
      return;
    }

    setDraftVertices((current) => {
      if (current.length >= MAX_VERTICES) {
        toast.error(`A geofence can have at most ${MAX_VERTICES} vertices.`);
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

    if (draftVertices.length < 3) {
      toast.error("A geofence needs at least 3 vertices.");
      return;
    }

    if (!canAddMoreGeofences) {
      toast.error(`You can only create ${MAX_GEOFENCES} geofences per device.`);
      return;
    }

    const nextIndex = activeDeviceGeofences.length;

    try {
      await setGeofence(selectedImei, {
        geofence_number: `GEO${nextIndex + 1}`,
        geofence_id: `Geofence ${nextIndex + 1}`,
        coordinates: draftVertices.map(([latitude, longitude]) => ({
          latitude,
          longitude,
        })),
      });
      setDraftVertices([]);
      toast.success(`Geofence ${nextIndex + 1} saved for device ${selectedImei}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save geofence";
      toast.error(message);
    }
  };

  const removeGeofence = (id: string) => {
    removeGeofenceLocally(id);
    toast.success("Geofence removed.");
  };

  return (
    <div className="space-y-6">
      <GeofencingHeader
        geofenceCount={activeDeviceGeofences.length}
        draftVertexCount={draftVertices.length}
        maxGeofences={MAX_GEOFENCES}
        maxVertices={MAX_VERTICES}
      />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <TargetDeviceCard
            routeImei={routeImei}
            devices={devices}
            selectedImei={selectedImei}
            selectedDevice={selectedDevice}
            isLoadingDevices={isLoadingDevices}
            onSelectImei={(value) => {
              setSelectedImei(value);
              setDraftVertices([]);
            }}
          />

          <DraftControlsCard
            selectedImei={selectedImei}
            draftVertexCount={draftVertices.length}
            canAddMoreGeofences={canAddMoreGeofences}
            isSaving={geofenceCommandLoading}
            onUndo={undoLastVertex}
            onClear={clearDraft}
            onSave={saveDraft}
          />

          <SavedGeofencesCard
            selectedImei={selectedImei}
            geofences={activeDeviceGeofences}
            onRemoveGeofence={removeGeofence}
          />
        </div>

        <GeofenceMapEditor
          selectedImei={selectedImei}
          draftVertices={draftVertices}
          activeDeviceGeofences={activeDeviceGeofences}
          onAddDraftVertex={addDraftVertex}
        />
      </div>
    </div>
  );
}

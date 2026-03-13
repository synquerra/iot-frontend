import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { listDevices, type Device } from "@/features/devices/services/deviceService";
import { AddGeofenceDialog } from "./components/AddGeofenceDialog";
import { CurrentGeofencesMap } from "./components/CurrentGeofencesMap";
import { GeofencingHeader } from "./components/GeofencingHeader";
import { SavedGeofencesCard } from "./components/SavedGeofencesCard";
import { TargetDeviceCard } from "./components/TargetDeviceCard";
import {
  GEOFENCE_COLORS,
  MAX_GEOFENCES,
  MAX_VERTICES,
} from "./constants";
import { useGeofenceCommand, type GeofencePayload } from "./hooks/useGeofenceCommand";
import { toLatLngTuple } from "./utils";

export default function GeofencingPage() {
  const { imei: routeImei } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");
  const [isAddGeofenceOpen, setIsAddGeofenceOpen] = useState(false);
  const {
    geofences: remoteGeofences,
    loading: geofenceCommandLoading,
    fetchGeofences,
    setGeofence,
    removeGeofenceLocally,
  } = useGeofenceCommand();

  useEffect(() => {
    setSelectedImei(routeImei ?? "");
    setIsAddGeofenceOpen(false);
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
        id: geofence.id ?? geofence.geofence_number,
        label: geofence.geofence_id,
        imei: selectedImei,
        color: GEOFENCE_COLORS[index % GEOFENCE_COLORS.length],
        coordinates: toLatLngTuple(geofence.coordinates),
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

  const removeGeofence = (geofenceNumber: string) => {
    removeGeofenceLocally(geofenceNumber);
    toast.success("Geofence removed.");
  };

  const openAddGeofenceModal = () => {
    if (!selectedImei) {
      toast.error("Select a device before adding a geofence.");
      return;
    }

    if (!canAddMoreGeofences) {
      toast.error(`You can only create ${MAX_GEOFENCES} geofences per device.`);
      return;
    }

    setIsAddGeofenceOpen(true);
  };

  const saveGeofence = async (imei: string, payload: GeofencePayload) => {
    await setGeofence(imei, payload);
  };

  return (
    <div className="space-y-6">
      <GeofencingHeader
        geofenceCount={activeDeviceGeofences.length}
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
              setIsAddGeofenceOpen(false);
            }}
          />

          <SavedGeofencesCard
            selectedImei={selectedImei}
            geofences={remoteGeofences}
            canAddGeofence={canAddMoreGeofences}
            isAddingDisabled={!selectedImei || !canAddMoreGeofences}
            onAddGeofence={openAddGeofenceModal}
            onRemoveGeofence={removeGeofence}
          />
        </div>

        <CurrentGeofencesMap
          selectedImei={selectedImei}
          geofences={activeDeviceGeofences}
        />
      </div>

      <AddGeofenceDialog
        open={isAddGeofenceOpen}
        onOpenChange={setIsAddGeofenceOpen}
        selectedImei={selectedImei}
        activeDeviceGeofences={activeDeviceGeofences}
        canAddMoreGeofences={canAddMoreGeofences}
        isSaving={geofenceCommandLoading}
        maxGeofences={MAX_GEOFENCES}
        maxVertices={MAX_VERTICES}
        onSaveGeofence={saveGeofence}
      />
    </div>
  );
}

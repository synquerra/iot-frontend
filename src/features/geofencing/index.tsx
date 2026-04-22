import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { GeofenceSidebar } from "./components/GeofenceSidebar";
import { CurrentGeofencesMap } from "./components/CurrentGeofencesMap";
import { GeofenceDeviceHeader } from "./components/GeofenceDeviceHeader";
import { HardwareSlotManager } from "./components/HardwareSlotManager";
import { GeofenceEditorDialog } from "./components/GeofenceEditorDialog";
import { ConfirmationDialog } from "./components/ConfirmationDialog";
import * as geofenceService from "./services/geofenceService";
import * as deviceService from "@/features/devices/services/deviceService";
import type { GeofenceRecord, GeofenceAssignment } from "./types";

export default function GeofencingPage() {
  const [geofences, setGeofences] = useState<GeofenceRecord[]>([]);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [selectedImei, setSelectedImei] = useState<string>("");
  const [devices, setDevices] = useState<deviceService.Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assignments, setAssignments] = useState<GeofenceAssignment[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dialog states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const deviceData = await deviceService.listDevices();
        setDevices(deviceData);
        if (deviceData.length > 0) {
          const firstImei = deviceData[0].imei;
          setSelectedImei(firstImei);
          const geofenceData = await geofenceService.listGeofences(firstImei);
          setGeofences(geofenceData.data || []);
        }
      } catch (error) {
        toast.error("Failed to load geofencing data");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch geofences and assignments when device selection changes
  useEffect(() => {
    if (selectedImei) {
      const loadDeviceData = async () => {
        try {
          const geofenceData = await geofenceService.listGeofences(selectedImei);
          setGeofences(geofenceData.data || []);
          const currentAssignments = (geofenceData.data || [])
            .filter((g: any) => g.geofence_number)
            .map((g: any) => ({
              imei: selectedImei,
              geofence_id: String(g.geofence_id),
              geofence_number: g.geofence_number,
              status: "ACTIVE" as const
            }));
          setAssignments(currentAssignments);
        } catch (error) {
          console.error("Failed to load device data", error);
        }
      };
      loadDeviceData();
    }
  }, [selectedImei]);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.imei === selectedImei) || null,
    [devices, selectedImei]
  );

  const selectedGeofence = useMemo(
    () => geofences.find((g) => g.geofence_id === selectedGeofenceId) || null,
    [geofences, selectedGeofenceId]
  );

  const handleUpdateAssignment = (slot: "GEO1" | "GEO2" | "GEO3", geofenceId: string | null) => {
    setAssignments(prev => {
      const filtered = prev.filter(a => a.geofence_number !== slot);
      if (geofenceId === null) return filtered;
      return [...filtered, {
        imei: selectedImei,
        geofence_id: geofenceId,
        geofence_number: slot,
        status: "PENDING"
      } as any];
    });
  };

  const handleSyncToDevice = async () => {
    try {
      setIsSyncing(true);
      const response = await geofenceService.assignGeofences(selectedImei, assignments);
      toast.success(response.message || "Geofence assignments processed");
      const geofenceData = await geofenceService.listGeofences(selectedImei);
      setGeofences(geofenceData.data || []);
    } catch (error) {
      toast.error("Failed to synchronize with device");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveGeofence = async () => {
    if (!selectedGeofence) return;

    if (!selectedGeofence.coordinates || selectedGeofence.coordinates.length !== 5) {
      toast.error("Geofence must have exactly 5 points");
      return;
    }

    try {
      setIsSaving(true);
      if (selectedGeofence.geofence_id.startsWith("temp-")) {
        const { geofence_id, created_at, updated_at, id, ...data } = selectedGeofence as any;
        await geofenceService.createGeofence({ ...data, imei: selectedImei } as any);
        toast.success("Geofence created successfully");
      } else {
        const { created_at, updated_at, id, ...data } = selectedGeofence as any;
        await geofenceService.editGeofence({ ...data, imei: selectedImei } as any);
        toast.success("Geofence updated successfully");
      }
      const data = await geofenceService.listGeofences(selectedImei);
      setGeofences(data.data || []);
      setSelectedGeofenceId(null);
      setIsEditorOpen(false);
    } catch (error) {
      toast.error("Failed to save geofence");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsSaving(true);
      await geofenceService.deleteGeofence(selectedImei, deleteTargetId);
      setGeofences(prev => prev.filter(g => g.geofence_id !== deleteTargetId));
      if (selectedGeofenceId === deleteTargetId) setSelectedGeofenceId(null);
      toast.success("Geofence deleted");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete geofence");
    } finally {
      setIsSaving(false);
      setDeleteTargetId(null);
    }
  };

  const handleUpdateGeofence = (updates: Partial<GeofenceRecord>) => {
    setGeofences(prev => prev.map(g => 
      g.geofence_id === selectedGeofenceId ? { ...g, ...updates } : g
    ));
  };

  const handleAddGeofence = () => {
    const newId = `temp-${Date.now()}`;
    const newGeo: GeofenceRecord = {
      geofence_id: newId,
      geofence_name: "New Geofence",
      flag: "Safe",
      color: "#4f46e5",
      coordinates: [],
      is_active: true,
      geofence_number: null
    };
    setGeofences(prev => [newGeo, ...prev]);
    setSelectedGeofenceId(newId);
    setIsEditorOpen(true);
  };

  const handleEditGeofence = (id: string) => {
    setSelectedGeofenceId(id);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <GeofenceDeviceHeader
        devices={devices}
        selectedImei={selectedImei}
        selectedDevice={selectedDevice}
        onSelectImei={setSelectedImei}
        isLoading={isLoading}
      />

      <HardwareSlotManager
        selectedImei={selectedImei}
        allGeofences={geofences}
        assignments={assignments}
        onUpdateAssignment={handleUpdateAssignment}
        onSave={handleSyncToDevice}
        isSaving={isSyncing}
      />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] min-h-[600px] gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 h-[300px] lg:h-auto border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
          <GeofenceSidebar
            geofences={geofences}
            onSelect={(id) => setSelectedGeofenceId(id)}
            onAdd={handleAddGeofence}
            onEdit={handleEditGeofence}
            selectedId={selectedGeofenceId}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
        </div>

        {/* View Map area */}
        <div className="flex-1 flex flex-col min-w-0 border border-border rounded-xl bg-card shadow-sm overflow-hidden relative">
          <CurrentGeofencesMap
            activeCoordinates={selectedGeofence?.coordinates || []}
            activeColor={selectedGeofence?.color}
            onAddPoint={() => {}} // Disabled on view map
            onClearPoints={() => {}} // Disabled on view map
            otherGeofences={geofences
              .filter(g => g.geofence_id !== selectedGeofenceId && g.coordinates)
              .map(g => ({ geofence_id: g.geofence_id, coordinates: g.coordinates!, color: g.color })) as any}
            isEditing={false} // View mode
            deviceLocation={selectedDevice?.latitude && selectedDevice?.longitude
              ? [parseFloat(selectedDevice.latitude), parseFloat(selectedDevice.longitude)]
              : undefined}
          />
        </div>
      </div>

      {/* Editor Modal */}
      {selectedGeofence && (
        <GeofenceEditorDialog
          isOpen={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          geofence={selectedGeofence}
          onChange={handleUpdateGeofence}
          onSave={handleSaveGeofence}
          isSaving={isSaving}
          deviceLocation={selectedDevice?.latitude && selectedDevice?.longitude
            ? [parseFloat(selectedDevice.latitude), parseFloat(selectedDevice.longitude)]
            : undefined}
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Geofence"
        description="Are you sure you want to permanently delete this geofence? This action cannot be undone and will remove the zone from the device if assigned."
        confirmLabel="Delete Forever"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={isSaving}
      />
    </div>
  );
}

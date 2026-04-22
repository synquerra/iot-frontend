import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { 
  listGeofences, 
  editGeofence, 
  deleteGeofence, 
  assignGeofences 
} from "../services/geofenceService";
import type { 
  GeofenceRecord, 
  GeofenceAssignment 
} from "../types";
import type { LatLngTuple } from "leaflet";

export function useGeofenceManager(selectedImei: string) {
  const [geofences, setGeofences] = useState<GeofenceRecord[]>([]);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<GeofenceAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchGeofenceData = useCallback(async (imei: string) => {
    if (!imei) {
      setGeofences([]);
      setAssignments([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await listGeofences(imei);
      setGeofences(response.data);
      
      const currentAssignments: GeofenceAssignment[] = response.data
        .filter(g => g.geofence_number)
        .map(g => ({
          imei,
          geofence_id: String(g.geofence_id),
          geofence_number: g.geofence_number as "GEO1" | "GEO2" | "GEO3",
          status: "ACTIVE" as const
        }));
      setAssignments(currentAssignments);
    } catch (err) {
      toast.error("Failed to fetch geofences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeofenceData(selectedImei);
  }, [selectedImei, fetchGeofenceData]);

  const selectedGeofence = useMemo(
    () => geofences.find(g => String(g.geofence_id) === selectedGeofenceId) || null,
    [geofences, selectedGeofenceId]
  );

  const handleAddPoint = (point: LatLngTuple) => {
    if (selectedGeofenceId === null) return;
    
    setGeofences(prev => prev.map(g => {
      if (String(g.geofence_id) === selectedGeofenceId) {
        return {
          ...g,
          coordinates: [...(g.coordinates || []), { lat: point[0], lng: point[1] }]
        };
      }
      return g;
    }));
  };

  const handleUpdateAssignment = (slot: "GEO1" | "GEO2" | "GEO3", geofenceId: string | null) => {
    setAssignments(prev => {
      const filtered = prev.filter(a => a.geofence_number !== slot && String(a.geofence_id) !== geofenceId);
      if (geofenceId === null) return filtered;
      return [...filtered, { 
        imei: selectedImei,
        geofence_id: geofenceId, 
        geofence_number: slot,
        status: "PENDING" as const
      }];
    });
  };

  const handleSaveGeofence = async () => {
    if (!selectedImei || !selectedGeofence) return;
    setIsSaving(true);
    try {
      if (selectedGeofenceId && !selectedGeofenceId.startsWith("temp-")) {
        const { created_at, updated_at, id, ...rest } = selectedGeofence as any;
        await editGeofence({
          ...rest,
          imei: selectedImei,
        });
        toast.success("Geofence updated");
      } else {
        toast.info("Create functionality coming soon in this hook");
      }
      fetchGeofenceData(selectedImei);
    } catch (err) {
      toast.error("Failed to save geofence");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncToDevice = async () => {
    if (!selectedImei) return;
    setIsSyncing(true);
    try {
      await assignGeofences(selectedImei, assignments);
      toast.success("Synchronized with device hardware");
      fetchGeofenceData(selectedImei);
    } catch (err) {
      toast.error("Failed to sync with device");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteGeofence = async () => {
    if (!selectedGeofenceId || !selectedImei) return;
    if (!confirm("Are you sure you want to delete this geofence?")) return;
    
    try {
      await deleteGeofence(selectedImei, selectedGeofenceId);
      toast.success("Geofence deleted");
      setSelectedGeofenceId(null);
      fetchGeofenceData(selectedImei);
    } catch (err) {
      toast.error("Failed to delete geofence");
    }
  };

  return {
    geofences,
    selectedGeofenceId,
    setSelectedGeofenceId,
    selectedGeofence,
    assignments,
    isLoading,
    isSaving,
    isSyncing,
    handleAddPoint,
    handleUpdateAssignment,
    handleSaveGeofence,
    handleSyncToDevice,
    handleDeleteGeofence,
  };
}

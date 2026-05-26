import { Button, Card, Select, Badge, Divider, Modal, Group, Text, Box } from "@mantine/core";
import { MapPin, Send, Maximize2, Share2, Plus, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import * as geofenceService from "@/features/geofencing/services/geofenceService";
import { CurrentGeofencesMap } from "@/features/geofencing/components/CurrentGeofencesMap";
import type { LatLngTuple } from "leaflet";
import type { GeofenceRecord } from "@/features/geofencing/types";

interface GeofenceSettingsProps {
  topic?: string | null;
  selectedImei: string;
  deviceLocation?: LatLngTuple;
}

export function GeofenceSettings({ topic, selectedImei, deviceLocation }: GeofenceSettingsProps) {
  const { setIsLoading } = useGlobalLoading();
  const [geoNumber, setGeoNumber] = useState<"GEO1" | "GEO2" | "GEO3">("GEO1");
  const [coords, setCoords] = useState(
    Array.from({ length: 5 }, () => ({ lat: "", lng: "" }))
  );
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [existingGeofences, setExistingGeofences] = useState<GeofenceRecord[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");

  useEffect(() => {
    if (selectedImei) {
      loadExistingGeofences();
    }
  }, [selectedImei]);

  const loadExistingGeofences = async () => {
    if (!selectedImei) return;
    try {
      console.log(`[GeofenceSettings] Loading geofences for IMEI: ${selectedImei}`);
      const response = await geofenceService.listGeofences(selectedImei);
      console.log(`[GeofenceSettings] Response:`, response);
      if (response && (response.status === "success" || Array.isArray(response.data))) {
        setExistingGeofences(response.data || []);
      } else if (Array.isArray(response)) {
        setExistingGeofences(response);
      } else {
        toast.error("Geofence records could not be retrieved");
      }
    } catch (error) {
      console.error("[GeofenceSettings] Failed to load geofences", error);
      toast.error("Network error while fetching geofences");
    }
  };

  const handleCoordChange = (index: number, axis: "lat" | "lng", value: string) => {
    const newCoords = [...coords];
    newCoords[index][axis] = value;
    setCoords(newCoords);
  };

  const handleAddMapPoint = (point: LatLngTuple) => {
    const emptyIndex = coords.findIndex(c => !c.lat || !c.lng);
    if (emptyIndex !== -1) {
      handleCoordChange(emptyIndex, "lat", point[0].toFixed(6));
      handleCoordChange(emptyIndex, "lng", point[1].toFixed(6));
    } else {
      toast.warning("All 5 points are already filled.");
    }
  };

  const handleClearPoints = () => {
    setCoords(Array.from({ length: 5 }, () => ({ lat: "", lng: "" })));
  };

  const handleSend = async () => {
    if (!selectedImei) {
      toast.error("Device identifier is missing.");
      return;
    }

    const formattedCoords = coords.map(c => ({
      lat: parseFloat(c.lat),
      lng: parseFloat(c.lng)
    }));

    if (formattedCoords.some(c => isNaN(c.lat) || isNaN(c.lng))) {
      toast.error("Please provide valid coordinates for all 5 points.");
      return;
    }

    try {
      setIsLoading(true, "Processing geofence...");

      const createResponse = await geofenceService.createGeofence({
        imei: selectedImei,
        geofence_name: `Test_${geoNumber}_${Date.now()}`,
        is_active: true,
        coordinates: formattedCoords,
        color: "#4f46e5",
        flag: "Safe"
      });

      if (createResponse.status !== "success") {
        throw new Error("Failed to create geofence record");
      }

      const geofenceId = String(createResponse.data.geofence_id);

      const assignResponse = await geofenceService.assignGeofences(selectedImei, [
        {
          geofence_id: geofenceId,
          geofence_number: geoNumber,
        }
      ]);

      if (assignResponse.status === "success") {
        toast.success(`Geofence created and assigned to ${geoNumber} slot`);
        loadExistingGeofences();
      } else {
        toast.error(assignResponse.message || "Failed to assign geofence to slot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process geofence");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncExisting = async () => {
    if (!selectedImei || !selectedExistingId) {
      toast.error("Select both a geofence and a slot.");
      return;
    }

    try {
      setIsLoading(true, `Syncing to ${geoNumber}...`);
      const response = await geofenceService.assignGeofences(selectedImei, [
        {
          geofence_id: selectedExistingId,
          geofence_number: geoNumber
        }
      ]);

      if (response.status === "success") {
        toast.success(`Geofence successfully synced to ${geoNumber}`);
      } else {
        toast.error(response.message || "Failed to sync geofence");
      }
    } catch (error: any) {
      toast.error(error.message || "Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  const activeMapPoints = coords
    .filter(c => c.lat && c.lng)
    .map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col p-0">
      <Group justify="space-between" align="center" className="py-3 px-4 border-b bg-muted/5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Text size="xs" fw={700} className="uppercase tracking-wide text-foreground font-bold">
            Geofence Control
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge color={topic ? "teal" : "red"} variant="light" className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0 h-4 border border-teal-200">
            {topic ? "Active Link" : "Offline"}
          </Badge>
          <Button 
            variant="outline" 
            color="gray"
            size="xs" 
            className="h-6 w-6 rounded-md p-0 flex items-center justify-center"
            onClick={() => setIsMapModalOpen(true)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </Group>

      <Box className="pt-4 p-4 space-y-5 flex-1 scroll-container overflow-y-auto max-h-[600px]">
        {/* Existing Assignment / Sync Section */}
        <Card padding="md" radius="md" withBorder className="space-y-3 bg-muted/20 border-border">
          <div className="flex items-center gap-2 mb-1">
             <Share2 className="h-3 w-3 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Sync to Device</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold uppercase text-muted-foreground/60">Choose Record</p>
              <Select
                value={selectedExistingId}
                onChange={(val) => setSelectedExistingId(val || "")}
                placeholder="Select existing geofence"
                data={existingGeofences.map(gf => ({ value: String(gf.geofence_id), label: gf.geofence_name || "" }))}
                styles={{ input: { height: '2rem', fontSize: '0.7rem', fontWeight: 700 } }}
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <p className="text-[9px] font-bold uppercase text-muted-foreground/60">Hardware Slot</p>
                <Select
                  value={geoNumber}
                  onChange={(val: any) => setGeoNumber(val || "GEO1")}
                  placeholder="Slot"
                  data={[
                    { value: "GEO1", label: "GEO1 (Slot 1)" },
                    { value: "GEO2", label: "GEO2 (Slot 2)" },
                    { value: "GEO3", label: "GEO3 (Slot 3)" },
                  ]}
                  styles={{ input: { height: '2rem', fontSize: '0.7rem', fontWeight: 700 } }}
                />
              </div>
              <Button 
                onClick={handleSyncExisting} 
                size="sm" 
                className="h-8 gap-2 font-black text-[9px] uppercase tracking-widest px-4"
                disabled={!selectedExistingId}
              >
                <Send size={10} className="mr-1" />
                Sync
              </Button>
            </div>
          </div>
        </Card>

        <Divider my="sm" className="opacity-40" />

        {/* New Creation Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <Plus className="h-3 w-3 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Draft New Boundary</span>
          </div>

          <div 
            className="h-20 w-full rounded-xl border border-dashed border-primary/20 bg-muted/40 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-muted/50 transition-colors"
            onClick={() => setIsMapModalOpen(true)}
          >
            <Layers className="h-4 w-4 text-primary/40 group-hover:text-primary/60 transition-colors" />
            <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">Visual Mapper Engine</span>
          </div>

          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3 text-center px-5">
                <span className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">Latitude</span>
                <span className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">Longitude</span>
             </div>
             
             <div className="space-y-1.5">
                {coords.map((coord, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0">
                       <span className="text-[9px] font-black text-muted-foreground/60">{idx + 1}</span>
                    </div>
                    <input 
                      placeholder="0.0000" 
                      value={coord.lat}
                      onChange={(e) => handleCoordChange(idx, "lat", e.target.value)}
                      className="h-7 text-[10px] font-mono bg-muted/30 px-2 rounded-md border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                    <input 
                      placeholder="0.0000" 
                      value={coord.lng}
                      onChange={(e) => handleCoordChange(idx, "lng", e.target.value)}
                      className="h-7 text-[10px] font-mono bg-muted/30 px-2 rounded-md border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                ))}
             </div>
          </div>
          
          <Button onClick={handleSend} size="sm" color="blue" className="w-full gap-2 font-black h-9 text-[10px] uppercase tracking-widest transition-all shadow-sm text-white">
            <Share2 size={12} className="mr-1" />
            Initialize & Sync
          </Button>
        </div>
      </Box>

      <Modal
        opened={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={
          <Text size="sm" fw={900} className="flex items-center gap-2 uppercase tracking-widest">
            <MapPin className="h-5 w-5 text-primary" />
            Visual Geofence Mapper
          </Text>
        }
        size="1000px"
        radius="md"
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: '70vh' }} className="relative">
          <CurrentGeofencesMap 
            activeCoordinates={activeMapPoints}
            onAddPoint={handleAddMapPoint}
            onClearPoints={handleClearPoints}
            otherGeofences={[]}
            isEditing={true}
            deviceLocation={deviceLocation}
            activeColor="#4f46e5"
          />
        </div>
        <div className="p-4 border-t bg-background flex justify-between items-center">
           <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Points Collected: <span className="text-primary">{activeMapPoints.length}</span> / 5
           </div>
           <div className="flex items-center gap-3">
              <Button variant="subtle" color="red" onClick={handleClearPoints} size="xs" className="h-8 font-black uppercase text-[10px] tracking-widest">
                 Reset Points
              </Button>
              <Button onClick={() => setIsMapModalOpen(false)} size="xs" className="h-8 font-black uppercase text-[10px] tracking-widest px-8 shadow-md">
                 Done Mapping
              </Button>
           </div>
        </div>
      </Modal>
    </Card>
  );
}

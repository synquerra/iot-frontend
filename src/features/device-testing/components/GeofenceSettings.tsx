import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Send, Maximize2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import * as geofenceService from "@/features/geofencing/services/geofenceService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrentGeofencesMap } from "@/features/geofencing/components/CurrentGeofencesMap";
import type { LatLngTuple } from "leaflet";

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
          imei: selectedImei,
          geofence_id: geofenceId,
          geofence_number: geoNumber,
          status: "PENDING"
        }
      ]);

      if (assignResponse.status === "success") {
        toast.success(`Geofence created and assigned to ${geoNumber} slot`);
      } else {
        toast.error(assignResponse.message || "Failed to assign geofence to slot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process geofence");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert current coords to LatLngTuple for map display
  const activeMapPoints = coords
    .filter(c => c.lat && c.lng)
    .map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-primary/5 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Create Geofence
        </CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 rounded-md border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          onClick={() => setIsMapModalOpen(true)}
        >
          <Maximize2 className="h-3.5 w-3.5 text-primary" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 flex-1">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Hardware Slot</label>
            <Select value={geoNumber} onValueChange={(val: any) => setGeoNumber(val)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select Slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GEO1">GEO1 (Slot 1)</SelectItem>
                <SelectItem value="GEO2">GEO2 (Slot 2)</SelectItem>
                <SelectItem value="GEO3">GEO3 (Slot 3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mini Preview Placeholder */}
        <div 
          className="h-24 w-full rounded-lg border border-dashed border-primary/20 bg-muted/30 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-muted/50 transition-colors"
          onClick={() => setIsMapModalOpen(true)}
        >
          <MapPin className="h-5 w-5 text-primary/40 group-hover:text-primary/60 transition-colors" />
          <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-wider">Launch Visual Mapper</span>
        </div>

        <div className="space-y-3">
           <div className="grid grid-cols-2 gap-3 text-center">
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Latitude</span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Longitude</span>
           </div>
           
           <div className="space-y-1.5">
             {coords.map((coord, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <span className="text-[9px] font-mono text-muted-foreground w-3">{idx + 1}</span>
                 <Input 
                   placeholder="0.0000" 
                   value={coord.lat}
                   onChange={(e) => handleCoordChange(idx, "lat", e.target.value)}
                   className="h-7 text-xs font-mono bg-muted/30"
                 />
                 <Input 
                   placeholder="0.0000" 
                   value={coord.lng}
                   onChange={(e) => handleCoordChange(idx, "lng", e.target.value)}
                   className="h-7 text-xs font-mono bg-muted/30"
                 />
               </div>
             ))}
           </div>
        </div>
        
        <Button onClick={handleSend} size="sm" className="w-full mt-2 gap-2 font-bold h-8 text-xs">
          <Send size={12} />
          Create & Sync Geofence
        </Button>
      </CardContent>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-[90vw] w-[1000px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-primary/20">
          <DialogHeader className="p-4 border-b bg-muted/30">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Visual Geofence Mapper
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative">
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
             <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Points Collected: {activeMapPoints.length} / 5
             </div>
             <Button onClick={() => setIsMapModalOpen(false)} size="sm" className="h-8 font-bold px-6">
                Done Mapping
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

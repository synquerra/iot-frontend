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
import { MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";

interface GeofenceSettingsProps {
  topic?: string | null;
}

export function GeofenceSettings({ topic }: GeofenceSettingsProps) {
  const { setIsLoading } = useGlobalLoading();
  const [geoNumber, setGeoNumber] = useState("1");
  const [geoId, setGeoId] = useState("01");
  const [coords, setCoords] = useState(
    Array.from({ length: 5 }, () => ({ x: "", y: "" }))
  );

  const handleCoordChange = (index: number, axis: "x" | "y", value: string) => {
    const newCoords = [...coords];
    newCoords[index][axis] = value;
    setCoords(newCoords);
  };

  const handleSend = async () => {
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }

    try {
      setIsLoading(true, "Creating geofence...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Geofence ${geoNumber} (ID: ${geoId}) created successfully`);
    } catch (error) {
      toast.error("Failed to create geofence");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-primary/5">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Create Geofence
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Geo Number</label>
            <Select value={geoNumber} onValueChange={setGeoNumber} disabled>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Number" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>GEO{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GeoID</label>
            <Select value={geoId} onValueChange={setGeoId} disabled>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None (Reset)</SelectItem>
                {["01", "02", "03", "04", "05"].map((id) => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
           <div className="grid grid-cols-2 gap-3 text-center">
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Latitude (X)</span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Longitude (Y)</span>
           </div>
           
           <div className="space-y-1.5">
             {coords.map((coord, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <span className="text-[9px] font-mono text-muted-foreground w-3">{idx + 1}</span>
                 <Input 
                   placeholder="0.0000" 
                   value={coord.x}
                   onChange={(e) => handleCoordChange(idx, "x", e.target.value)}
                   className="h-7 text-xs font-mono bg-muted/30"
                   disabled
                 />
                 <Input 
                   placeholder="0.0000" 
                   value={coord.y}
                   onChange={(e) => handleCoordChange(idx, "y", e.target.value)}
                   className="h-7 text-xs font-mono bg-muted/30"
                   disabled
                 />
               </div>
             ))}
           </div>
        </div>
        
        <Button onClick={handleSend} size="sm" className="w-full mt-2 gap-2 font-bold h-8 text-xs" disabled>
          <Send size={12} />
          Send Geofence
        </Button>
      </CardContent>
    </Card>
  );
}

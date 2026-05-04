import { MapPin, X, Zap, RefreshCw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GeofenceRecord, GeofenceAssignment } from "../types";

interface HardwareSlotManagerProps {
  selectedImei: string;
  allGeofences: GeofenceRecord[];
  assignments: GeofenceAssignment[];
  onUpdateAssignment: (slot: "GEO1" | "GEO2" | "GEO3", geofenceId: string | null) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function HardwareSlotManager({
  selectedImei,
  allGeofences,
  assignments,
  onUpdateAssignment,
  onSave,
  isSaving,
}: HardwareSlotManagerProps) {
  const getGeofenceById = (id: string) => allGeofences.find((g) => g.geofence_id === id);

  const renderSlot = (slotLabel: string, slotKey: "GEO1" | "GEO2" | "GEO3") => {
    const assignment = assignments.find((a) => a.geofence_number === slotKey);
    const geofence = assignment ? getGeofenceById(assignment.geofence_id) : null;

    return (
      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {slotLabel}
          </Label>
          {geofence && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateAssignment(slotKey, null)}
              className="h-4 w-4 hover:text-destructive text-muted-foreground/50 transition-colors"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className={cn(
          "relative h-10 rounded-md border transition-all duration-200",
          geofence 
            ? "bg-accent/40 border-primary/20 shadow-sm" 
            : "border-dashed bg-muted/10 hover:bg-muted/20"
        )}>
          {geofence ? (
            <div className="flex items-center h-full px-3 gap-2">
              <div 
                className="h-5 w-5 rounded flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: geofence.color || "#2563eb" }}
              >
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium truncate">
                {geofence.geofence_name}
              </span>
            </div>
          ) : (
            <Select onValueChange={(val) => onUpdateAssignment(slotKey, val)}>
              <SelectTrigger className="h-full border-none bg-transparent px-3 hover:bg-transparent focus:ring-0 shadow-none">
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">Assign Geofence</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {allGeofences
                  .filter(g => !assignments.some(a => a.geofence_id === g.geofence_id))
                  .map((g) => (
                    <SelectItem key={g.geofence_id} value={g.geofence_id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color || "#2563eb" }} />
                        <span className="text-sm">{g.geofence_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                {allGeofences.length === 0 && (
                   <div className="p-4 text-xs text-muted-foreground text-center">No geofences created yet</div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm border-border overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
             <Cpu className="h-4 w-4 text-primary" />
             <h3 className="text-md font-bold tracking-tight">Sync to Device</h3>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
            Assign up to 3 hardware geofence slots
          </p>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-4 flex flex-col xl:flex-row items-stretch xl:items-center gap-6">
        {/* Slots Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {renderSlot("Slot 1", "GEO1")}
          {renderSlot("Slot 2", "GEO2")}
          {renderSlot("Slot 3", "GEO3")}
        </div>

        <Separator orientation="vertical" className="hidden xl:block h-10" />
        <Separator orientation="horizontal" className="xl:hidden" />

        {/* Action Button */}
        <div className="shrink-0 flex items-center pt-2 xl:pt-0">
          <Button
            onClick={onSave}
            disabled={isSaving || !selectedImei}
            size="lg"
            className={cn(
              "w-full xl:w-auto font-bold px-8 shadow-sm transition-all",
              !isSaving && "hover:shadow-primary/20"
            )}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { MapPin, X, Shield, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
      <div className="flex flex-col gap-1 min-w-[140px]">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
            {slotLabel}
          </span>
          {geofence && (
            <button
              onClick={() => onUpdateAssignment(slotKey, null)}
              className="hover:text-destructive text-muted-foreground/30 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
        
        <div className={cn(
          "h-10 px-2 rounded-lg border flex items-center gap-2 transition-all duration-300",
          geofence 
            ? "bg-primary/[0.03] border-primary/20 shadow-sm" 
            : "bg-muted/30 border-dashed border-border hover:border-primary/30 hover:bg-muted/50"
        )}>
          {geofence ? (
            <>
              <div 
                className="h-6 w-6 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${geofence.color || "#2563eb"}20` }}
              >
                <MapPin className="h-3.5 w-3.5" style={{ color: geofence.color || "#2563eb" }} />
              </div>
              <p className="text-[11px] font-bold truncate text-foreground/80">
                {geofence.geofence_name}
              </p>
            </>
          ) : (
            <Select onValueChange={(val) => onUpdateAssignment(slotKey, val)}>
              <SelectTrigger className="border-none bg-transparent h-full w-full p-0 flex items-center gap-2 focus:ring-0 group">
                <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Zap className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  Empty Slot
                </span>
              </SelectTrigger>
              <SelectContent>
                {allGeofences
                  .filter(g => !assignments.some(a => a.geofence_id === g.geofence_id))
                  .map((g) => (
                    <SelectItem key={g.geofence_id} value={g.geofence_id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color || "#2563eb" }} />
                        <span className="text-xs font-semibold">{g.geofence_name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-card/50 backdrop-blur-md border border-border rounded-xl p-3 flex items-center gap-6 shadow-sm">
      <div className="flex items-center gap-4 border-r border-border pr-6 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
          <Shield className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-tight text-foreground uppercase">
            Hardware Slots
          </h2>
          <p className="text-[9px] text-muted-foreground italic font-medium">
            Order does not matter
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4">
        {renderSlot("Slot 01", "GEO1")}
        {renderSlot("Slot 02", "GEO2")}
        {renderSlot("Slot 03", "GEO3")}
      </div>

      <div className="pl-6 border-l border-border shrink-0">
        <Button
          onClick={onSave}
          disabled={isSaving || !selectedImei}
          className={cn(
            "h-10 px-8 font-black text-[10px] uppercase tracking-[0.1em] shadow-lg transition-all text-white",
            isSaving ? "bg-muted" : "bg-primary hover:bg-primary/90 shadow-primary/20"
          )}
        >
          {isSaving ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" />
          ) : (
            <Zap className="h-3.5 w-3.5 mr-2" />
          )}
          {isSaving ? "Syncing..." : "Sync to Device"}
        </Button>
      </div>
    </div>
  );
}

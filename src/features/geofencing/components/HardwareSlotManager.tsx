import { MapPin, X, Zap, RefreshCw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
            {slotLabel}
          </span>
          {geofence && (
            <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 h-4 uppercase border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
               Active
            </Badge>
          )}
        </div>
        
        <div className={cn(
          "relative h-12 rounded-xl border transition-all duration-300",
          geofence 
            ? "bg-primary/5 border-primary/20 shadow-sm" 
            : "border-dashed border-border bg-muted/20 hover:bg-muted/30"
        )}>
          {geofence ? (
            <div className="flex items-center justify-between h-full px-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/20"
                  style={{ backgroundColor: geofence.color || "#4f46e5" }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-tight truncate leading-none mb-1">
                    {geofence.geofence_name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/60 leading-none">
                    ID: {geofence.geofence_id.slice(-6)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdateAssignment(slotKey, null)}
                className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/30 transition-all"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Select onValueChange={(val) => onUpdateAssignment(slotKey, val)}>
              <SelectTrigger className="h-full border-none bg-transparent px-4 hover:bg-transparent focus:ring-0 shadow-none">
                <div className="flex items-center gap-2.5 text-muted-foreground/40">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Assign Record</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                {allGeofences
                  .filter(g => !assignments.some(a => a.geofence_id === g.geofence_id))
                  .map((g) => (
                    <SelectItem key={g.geofence_id} value={g.geofence_id} className="py-2.5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: g.color || "#4f46e5" }} />
                        <span className="text-[11px] font-bold uppercase tracking-tight">{g.geofence_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                {allGeofences.length === 0 && (
                   <div className="p-6 text-center">
                     <p className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-widest mb-1">No Boundaries Found</p>
                     <p className="text-[9px] text-muted-foreground/30 italic">Create a geofence first</p>
                   </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm border-border rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-foreground">
             <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cpu className="h-4 w-4 text-primary" />
             </div>
             <div>
                <h3 className="text-sm font-black tracking-widest uppercase text-foreground/80">Hardware Node Sync</h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Remote Geofence Provisioning</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
             <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 py-0.5 h-5 bg-muted/30 border-border/50">
               Slots: 3/3 Available
             </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 flex flex-col xl:flex-row items-stretch xl:items-center gap-8">
        {/* Slots Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderSlot("GEO1 Node", "GEO1")}
          {renderSlot("GEO2 Node", "GEO2")}
          {renderSlot("GEO3 Node", "GEO3")}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center pt-2 xl:pt-0">
          <Button
            onClick={onSave}
            disabled={isSaving || !selectedImei}
            size="lg"
            className={cn(
              "w-full xl:w-auto font-black uppercase tracking-[0.15em] text-[10px] h-11 px-8 shadow-lg transition-all rounded-xl",
              isSaving ? "bg-muted" : "bg-primary hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-3 opacity-50" />
                Synchronizing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-3" />
                Sync to Device
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

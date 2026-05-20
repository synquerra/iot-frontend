import { MapPin, X, RefreshCw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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

  const pendingCount = assignments.filter(
    (a) => a.status === "PENDING" || a.geofence_id.startsWith("desync-")
  ).length;

  const renderSlot = (slotLabel: string, slotKey: "GEO1" | "GEO2" | "GEO3") => {
    const assignment = assignments.find((a) => a.geofence_number === slotKey);
    const isDesyncPending = assignment?.geofence_id?.startsWith("desync-") || false;
    const originalGeofenceId = (isDesyncPending && assignment?.geofence_id)
      ? assignment.geofence_id.replace("desync-", "")
      : "";
    const hasGeofence = assignment && !isDesyncPending;
    const geofence = hasGeofence ? getGeofenceById(assignment.geofence_id) : null;
    const isPending = assignment?.status === "PENDING";

    return (
      <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full group/slot">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-foreground/75 uppercase tracking-[0.15em]">
            {slotLabel}
          </span>
          {/* Status Badges */}
          {isDesyncPending ? (
            <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 h-4.5 uppercase border-rose-500/30 text-rose-500 bg-rose-500/10 animate-pulse">
               To Desync
            </Badge>
          ) : isPending ? (
            <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 h-4.5 uppercase border-amber-500/30 text-amber-500 bg-amber-500/10 animate-pulse">
               To Sync
            </Badge>
          ) : geofence ? (
            <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 h-4.5 uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
               Synced
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 h-4.5 uppercase border-border/80 text-muted-foreground/50 bg-muted/10">
               Empty
            </Badge>
          )}
        </div>
        
        <div className={cn(
          "relative h-14 rounded-2xl border transition-all duration-300 shadow-sm flex items-center justify-between px-4 overflow-hidden",
          isDesyncPending
            ? "bg-rose-500/5 border-rose-500/25 border-dashed"
            : isPending
            ? "bg-amber-500/5 border-amber-500/30 shadow-md"
            : geofence 
            ? "bg-card border-border hover:border-primary/20 hover:bg-card/90" 
            : "border-dashed border-border/80 bg-muted/20 hover:bg-muted/30 hover:border-primary/20 cursor-pointer"
        )}>
          {geofence && !isDesyncPending ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                  style={{ backgroundColor: geofence.color || "#4f46e5" }}
                >
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-tight truncate leading-none mb-1 text-foreground">
                    {geofence.geofence_name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/60 leading-none">
                    ID: {geofence.geofence_id}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onUpdateAssignment(slotKey, null)}
                className="h-7 w-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/40 hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Desync Geofence"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : isDesyncPending ? (
            <>
              <div className="flex items-center gap-3 min-w-0 opacity-60">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <X className="h-4 w-4 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-tight truncate leading-none mb-1 text-rose-500 line-through">
                    {getGeofenceById(originalGeofenceId)?.geofence_name || "Geofence"}
                  </span>
                  <span className="text-[9px] font-bold text-rose-400/70 leading-none">
                    Pending De-provisioning
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onUpdateAssignment(slotKey, originalGeofenceId)}
                className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground/40 hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Undo Desync"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Select onValueChange={(val) => onUpdateAssignment(slotKey, val)}>
              <SelectTrigger className="absolute inset-0 w-full h-full border-none bg-transparent px-4 hover:bg-transparent focus:ring-0 shadow-none flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-muted-foreground/50">
                  <Cpu className="h-4 w-4 text-primary/40 group-hover/slot:text-primary/70 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest group-hover/slot:text-foreground/80 transition-colors">Assign Record</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-xl bg-card z-[1200]">
                {allGeofences
                  .filter((g) => !assignments.some((a) => a.geofence_id === g.geofence_id && a.geofence_number !== slotKey))
                  .map((g) => (
                    <SelectItem key={g.geofence_id} value={g.geofence_id} className="py-2.5 rounded-lg focus:bg-primary/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-3.5 w-3.5 rounded-md border border-white/10 shrink-0" style={{ backgroundColor: g.color || "#4f46e5" }} />
                        <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{g.geofence_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                {allGeofences.filter((g) => !assignments.some((a) => a.geofence_id === g.geofence_id && a.geofence_number !== slotKey)).length === 0 && (
                   <div className="p-6 text-center">
                     <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-widest mb-1">No Available Records</p>
                     <p className="text-[9px] text-muted-foreground/30 italic">Create or select another geofence</p>
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
      <CardContent className="p-4 md:p-5 flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
        {/* Slots Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderSlot("GEO1 Node", "GEO1")}
          {renderSlot("GEO2 Node", "GEO2")}
          {renderSlot("GEO3 Node", "GEO3")}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3.5 pt-3 lg:pt-0">

          <Button
            onClick={onSave}
            disabled={isSaving || !selectedImei || pendingCount === 0}
            size="lg"
            className={cn(
              "w-full lg:w-auto font-black uppercase tracking-[0.15em] text-[10px] h-11 px-8 shadow-lg transition-all rounded-xl",
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

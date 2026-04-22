import * as Dialog from "@radix-ui/react-dialog";
import { X, Map as MapIcon, ShieldCheck, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeofenceEditorForm } from "./GeofenceEditorForm";
import { GeofenceEditorMap } from "./GeofenceEditorMap";
import type { GeofenceRecord } from "../types";
import type { LatLngTuple } from "leaflet";

interface GeofenceEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  geofence: GeofenceRecord;
  onChange: (updates: Partial<GeofenceRecord>) => void;
  onSave: () => void;
  isSaving?: boolean;
  deviceLocation?: LatLngTuple;
}

export function GeofenceEditorDialog({
  isOpen,
  onOpenChange,
  geofence,
  onChange,
  onSave,
  isSaving,
  deviceLocation,
}: GeofenceEditorDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-[1100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[1200px] h-[95vh] md:h-[85vh] bg-card border border-border shadow-2xl rounded-2xl z-[1101] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                <MapIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="text-lg font-bold tracking-tight text-foreground leading-none mb-1.5 truncate">
                  Edit Geofence
                </Dialog.Title>
                <Dialog.Description className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5 leading-none">
                  Setting up <span className="text-primary font-semibold truncate max-w-[100px]">{geofence.geofence_name || "New Zone"}</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                  Slot: <span className="text-foreground font-medium uppercase">{geofence.geofence_number || "Auto"}</span>
                </Dialog.Description>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1 sm:flex-none h-8 px-4 text-xs font-bold border-border bg-background shadow-sm hover:bg-muted transition-all">
                  Discard
                </Button>
              </Dialog.Close>
              <Button 
                onClick={onSave} 
                disabled={isSaving}
                className="flex-1 sm:flex-none h-8 px-6 text-xs font-bold shadow-lg shadow-primary/20 text-white bg-primary hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Sync & Save"}
              </Button>
              <div className="hidden sm:block w-px h-6 bg-border mx-1" />
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 rounded-full hover:bg-muted/50">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Form Section (Left on desktop, top on mobile) */}
            <div className="w-full md:w-[360px] h-[300px] md:h-auto flex flex-col bg-background border-b md:border-b-0 md:border-r border-border overflow-hidden shrink-0 order-2 md:order-1">
              <div className="p-4 border-b border-border bg-muted/10 hidden md:block">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Zone Parameters
                  </p>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-semibold text-primary/80">
                    Geometry: <span className="font-black">{geofence.coordinates?.length || 0}/5 Points</span>
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar bg-card/50">
                <GeofenceEditorForm geofence={geofence} onChange={onChange} />
              </div>

              <div className="p-3 bg-muted/20 border-t border-border hidden md:block">
                <p className="text-[9px] text-center text-muted-foreground font-medium italic leading-tight">
                  Verify exactly 5 points are defined before saving.
                </p>
              </div>
            </div>

            {/* Map Section (Right on desktop, main on mobile) */}
            <div className="flex-1 relative bg-muted/5 order-1 md:order-2">
              <GeofenceEditorMap
                activeCoordinates={geofence.coordinates || []}
                activeColor={geofence.color}
                onAddPoint={(point) => {
                  const currentCoords = geofence.coordinates || [];
                  if (currentCoords.length >= 5) return;
                  onChange({
                    coordinates: [...currentCoords, { lat: point[0], lng: point[1] }]
                  });
                }}
                onClearPoints={() => onChange({ coordinates: [] })}
                deviceLocation={deviceLocation}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

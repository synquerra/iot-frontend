import * as Dialog from "@radix-ui/react-dialog";
import { X, Settings2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeofenceEditorForm } from "./GeofenceEditorForm";
import type { GeofenceRecord } from "../types";

interface GeofenceConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  geofence: GeofenceRecord;
  onChange: (updates: Partial<GeofenceRecord>) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function GeofenceConfigDialog({
  isOpen,
  onOpenChange,
  geofence,
  onChange,
  onSave,
  isSaving,
}: GeofenceConfigDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl z-[1101] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex flex-col h-[85vh] max-h-[800px]">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold tracking-tight">
                    Geofence Configuration
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">
                    Define boundary properties, alert triggers, and aesthetics.
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-background/50">
              <div className="space-y-8">
                {/* Status Badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-medium text-blue-700">
                    Geometry verified: <span className="font-bold">{geofence.coordinates?.length || 0}/5 Points</span>
                  </p>
                </div>

                <GeofenceEditorForm geofence={geofence} onChange={onChange} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[10px] font-medium uppercase tracking-wider">
                  Hardware Slot: {geofence.geofence_number || "Unassigned"}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Dialog.Close asChild>
                  <Button variant="outline" className="font-semibold px-6 border-border">
                    Continue Drawing
                  </Button>
                </Dialog.Close>
                <Button 
                  onClick={onSave} 
                  disabled={isSaving}
                  className="font-bold px-8 shadow-lg shadow-primary/20 text-white"
                >
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { Settings2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button, Modal, Group, Text } from "@mantine/core";
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
    <Modal
      opened={isOpen}
      onClose={() => onOpenChange(false)}
      size="2xl"
      radius="lg"
      title={
        <Group justify="space-between" align="center" className="w-full">
          <Group gap="sm">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Text size="md" fw={700}>Geofence Configuration</Text>
              <Text size="xs" className="text-muted-foreground">
                Define boundary properties, alert triggers, and aesthetics.
              </Text>
            </div>
          </Group>
        </Group>
      }
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col h-[85vh] max-h-[800px]">
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
            <Button variant="outline" color="gray" onClick={() => onOpenChange(false)} className="font-semibold px-6 border-border text-xs">
              Continue Drawing
            </Button>
            <Button 
              onClick={onSave} 
              color="blue"
              disabled={isSaving}
              className="font-bold px-8 shadow-lg text-white text-xs"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

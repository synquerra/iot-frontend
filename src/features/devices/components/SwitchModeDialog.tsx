import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Layers, Loader2, CheckCircle2, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { listModes } from "@/features/modes/services/modeService";
import type { DeviceMode } from "@/features/modes/types";
import { switchDeviceMode } from "../services/deviceService";

interface SwitchModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imei: string;
  currentModeName?: string | null;
  onSwitched?: () => void;
}

export function SwitchModeDialog({
  open,
  onOpenChange,
  imei,
  currentModeName,
  onSwitched,
}: SwitchModeDialogProps) {
  const [modes, setModes] = useState<DeviceMode[]>([]);
  const [loadingModes, setLoadingModes] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingModes(true);
    setSelectedModeId(null);
    listModes()
      .then((res) => {
        if (res.status === "success") setModes(res.data ?? []);
      })
      .catch(() => toast.error("Failed to load available modes"))
      .finally(() => setLoadingModes(false));
  }, [open]);

  const handleSwitch = async () => {
    if (!selectedModeId) return;
    setSwitching(true);
    try {
      await switchDeviceMode(imei, selectedModeId);
      const switched = modes.find((m) => m.id === selectedModeId);
      toast.success(`Mode switched to "${switched?.name ?? "selected"}" successfully`);
      onOpenChange(false);
      onSwitched?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to switch mode");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-widest">
              Switch Device Mode
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a mode to push to <span className="font-bold font-mono text-foreground">{imei}</span>.
            {currentModeName && (
              <span className="ml-1">
                Current mode:{" "}
                <span className="font-bold text-primary">{currentModeName}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {loadingModes ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : modes.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-8 font-semibold">
              No modes found. Create one in the Modes section.
            </p>
          ) : (
            modes.map((mode) => {
              const isSelected = selectedModeId === mode.id;
              const isCurrent =
                currentModeName?.toLowerCase() === mode.name.toLowerCase();
              return (
                <button
                  key={mode.id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setSelectedModeId(mode.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-muted/10 hover:bg-muted/30 hover:border-border/80",
                    isCurrent && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {mode.is_system_mode ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold truncate">{mode.name}</p>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 h-4 font-black uppercase tracking-widest border-emerald-400/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                        >
                          Current
                        </Badge>
                      )}
                      {mode.is_system_mode && !isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 h-4 font-black uppercase tracking-widest"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {mode.description || `Priority ${mode.priority} · Interval ${mode.normal_sending_interval}s`}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedModeId || switching}
            onClick={handleSwitch}
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
          >
            {switching ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Switching…
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                Apply Mode
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

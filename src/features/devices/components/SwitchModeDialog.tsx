import { useEffect, useState } from "react";
import { Button, Modal, Badge, Group, Box, Text, Loader, ActionIcon } from "@mantine/core";
import { cn } from "@/lib/utils";
import { Layers, CheckCircle2, Lock, Zap } from "lucide-react";
import { toast } from "@/lib/toast";
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
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title={
        <Group gap="xs">
          <ActionIcon variant="light" color="blue" size="md" radius="md">
            <Layers size="1.2rem" />
          </ActionIcon>
          <Text fw={900} tt="uppercase" className="tracking-widest" size="sm">
            Switch Device Mode
          </Text>
        </Group>
      }
      centered
      radius="xl"
      size="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Box mb="md">
        <Text size="xs" c="dimmed">
          Select a mode to push to <Text component="span" fw={700} ff="monospace" c="dark">{imei}</Text>.
          {currentModeName && (
            <Text component="span" ml={4}>
              Current mode: <Text component="span" fw={700} c="blue">{currentModeName}</Text>
            </Text>
          )}
        </Text>
      </Box>

      <Box className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {loadingModes ? (
          <Group justify="center" py={40}>
            <Loader color="gray" type="dots" />
          </Group>
        ) : modes.length === 0 ? (
          <Text size="xs" c="dimmed" ta="center" py={32} fw={600}>
            No modes found. Create one in the Modes section.
          </Text>
        ) : (
          modes.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            const isCurrent = currentModeName?.toLowerCase() === mode.name.toLowerCase();
            
            return (
              <Box
                key={mode.id}
                component="button"
                disabled={isCurrent}
                onClick={() => setSelectedModeId(mode.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                    : "border-border bg-muted/10 hover:bg-muted/30 hover:border-border/80",
                  isCurrent && "opacity-60 cursor-not-allowed"
                )}
              >
                <Box
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {mode.is_system_mode ? <Lock size="1rem" /> : <Zap size="1rem" />}
                </Box>
                
                <Box className="flex-1 min-w-0">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" fw={700} className="truncate">{mode.name}</Text>
                    {isCurrent && (
                      <Badge size="xs" variant="light" color="teal" className="tracking-widest uppercase">
                        Current
                      </Badge>
                    )}
                    {mode.is_system_mode && !isCurrent && (
                      <Badge size="xs" variant="outline" color="gray" className="tracking-widest uppercase">
                        System
                      </Badge>
                    )}
                  </Group>
                  <Text size="0.65rem" c="dimmed" className="truncate mt-0.5">
                    {mode.description || `Priority ${mode.priority} · Interval ${mode.normal_sending_interval}s`}
                  </Text>
                </Box>
                
                {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
              </Box>
            );
          })
        )}
      </Box>

      <Group justify="flex-end" gap="sm" mt="xl" grow>
        <Button variant="default" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={!selectedModeId}
          loading={switching}
          onClick={handleSwitch}
          leftSection={!switching && <Layers size="1rem" />}
        >
          Apply Mode
        </Button>
      </Group>
    </Modal>
  );
}

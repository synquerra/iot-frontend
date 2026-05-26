import { MapPin, X, RefreshCw, Cpu } from "lucide-react";
import { Button, Select, Card, Badge, Group, Box, Text, ActionIcon, SimpleGrid, ThemeIcon } from "@mantine/core";
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

    const getAvailableGeofences = () => {
      return allGeofences
        .filter((g) => !assignments.some((a) => a.geofence_id === g.geofence_id && a.geofence_number !== slotKey))
        .map(g => ({
          value: g.geofence_id,
          label: g.geofence_name,
        }));
    };

    return (
      <Box className="flex flex-col gap-2.5 flex-1 min-w-0 w-full group/slot">
        <Group justify="space-between" px={4}>
          <Text size="xs" fw={900} c="dimmed" tt="uppercase" className="tracking-[0.15em]">
            {slotLabel}
          </Text>
          {/* Status Badges */}
          {isDesyncPending ? (
            <Badge size="xs" variant="light" color="red" className="font-black tracking-widest uppercase animate-pulse">
               To Desync
            </Badge>
          ) : isPending ? (
            <Badge size="xs" variant="light" color="orange" className="font-black tracking-widest uppercase animate-pulse">
               To Sync
            </Badge>
          ) : geofence ? (
            <Badge size="xs" variant="light" color="teal" className="font-black tracking-widest uppercase">
               Synced
            </Badge>
          ) : (
            <Badge size="xs" variant="light" color="gray" className="font-black tracking-widest uppercase">
               Empty
            </Badge>
          )}
        </Group>
        
        <Box className={cn(
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
              <Group gap="sm" className="min-w-0 flex-1">
                <ThemeIcon variant="filled" color="indigo" radius="md" size="md">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </ThemeIcon>
                <Box className="flex-1 min-w-0">
                  <Text size="xs" fw={900} tt="uppercase" className="tracking-tight truncate leading-none mb-1">
                    {geofence.geofence_name}
                  </Text>
                  <Text size="0.6rem" c="dimmed" fw={700} ff="monospace" className="leading-none">
                    ID: {geofence.geofence_id}
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onUpdateAssignment(slotKey, null)}
                className="hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Desync Geofence"
              >
                <X size="1rem" />
              </ActionIcon>
            </>
          ) : isDesyncPending ? (
            <>
              <Group gap="sm" className="min-w-0 flex-1 opacity-60">
                <Box className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <X className="h-4 w-4 animate-pulse" />
                </Box>
                <Box className="flex-1 min-w-0">
                  <Text size="xs" fw={900} tt="uppercase" className="tracking-tight truncate leading-none mb-1 text-rose-500 line-through">
                    {getGeofenceById(originalGeofenceId)?.geofence_name || "Geofence"}
                  </Text>
                  <Text size="0.6rem" fw={700} className="text-rose-400/70 leading-none">
                    Pending De-provisioning
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={() => onUpdateAssignment(slotKey, originalGeofenceId)}
                className="hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Undo Desync"
              >
                <RefreshCw size="1rem" />
              </ActionIcon>
            </>
          ) : (
            <Select
              onChange={(val) => onUpdateAssignment(slotKey, val)}
              placeholder="ASSIGN RECORD"
              data={getAvailableGeofences()}
              variant="unstyled"
              className="absolute inset-0 w-full h-full"
              classNames={{
                input: "h-full w-full px-4 text-[10px] font-black tracking-widest uppercase cursor-pointer",
                dropdown: "bg-card border-border shadow-xl rounded-xl",
                option: "text-xs font-bold uppercase",
              }}
              leftSection={<Cpu size="0.9rem" className="text-muted-foreground ml-2" />}
              nothingFoundMessage={
                <Box p="md" className="text-center">
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" className="tracking-widest mb-1">No Available Records</Text>
                  <Text size="0.6rem" fs="italic" c="dimmed">Create or select another geofence</Text>
                </Box>
              }
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Card shadow="sm" radius="xl" withBorder className="bg-card/50 backdrop-blur-sm">
      <Box className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" className="flex-1">
          {renderSlot("GEO1 Node", "GEO1")}
          {renderSlot("GEO2 Node", "GEO2")}
          {renderSlot("GEO3 Node", "GEO3")}
        </SimpleGrid>

        <Group justify="flex-end" className="shrink-0 pt-3 lg:pt-0">
          <Button
            onClick={onSave}
            disabled={isSaving || !selectedImei || pendingCount === 0}
            size="md"
            loading={isSaving}
            leftSection={!isSaving && <RefreshCw size="1rem" />}
            className="w-full lg:w-auto font-black uppercase tracking-[0.15em] text-[10px] px-8 transition-all"
          >
            Sync to Device
          </Button>
        </Group>
      </Box>
    </Card>
  );
}

import { useState } from "react";
import { Search, Plus, Lock, Settings, ChevronRight, ShieldAlert, Settings2 } from "lucide-react";
import { ScrollArea, TextInput, Button, Box, Group, Text, Badge, NavLink } from "@mantine/core";
import { cn } from "@/lib/utils";
import type { DeviceMode } from "../types";

interface ModeSidebarProps {
  modes: DeviceMode[];
  selectedModeId: string | null;
  onSelectMode: (id: string) => void;
  onAddNew: () => void;
  loading: boolean;
}

export function ModeSidebar({
  modes,
  selectedModeId,
  onSelectMode,
  onAddNew,
  loading,
}: ModeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModes = modes.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemModes = filteredModes.filter((m) => m.is_system_mode);
  const customModes = filteredModes.filter((m) => !m.is_system_mode);

  const renderModeItem = (mode: DeviceMode) => {
    const isSelected = selectedModeId === mode.id;
    return (
      <NavLink
        key={mode.id}
        active={isSelected}
        onClick={() => onSelectMode(mode.id)}
        label={
          <Group gap="xs" align="center" wrap="nowrap">
            <Text size="xs" fw={700}>{mode.name}</Text>
            {mode.is_system_mode && <Lock size={10} style={{ opacity: 0.5 }} />}
          </Group>
        }
        description={`Priority: ${mode.priority}`}
        leftSection={
          <Box
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
            }}
            className={cn(
              isSelected ? "bg-white animate-pulse" : (mode.priority > 50 ? "bg-rose-500" : "bg-emerald-500")
            )}
          />
        }
        rightSection={isSelected ? <ChevronRight size={12} /> : null}
        className="rounded-md mb-1"
        variant="filled"
      />
    );
  };

  return (
    <Box className="w-full h-full flex flex-col bg-card overflow-hidden">
      {/* Panel Header */}
      <Box className="p-4 space-y-4 border-b border-border bg-muted/20">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <Settings className="h-4 w-4 text-primary" />
            <Text size="xs" fw={900} tt="uppercase" className="tracking-widest" c="dimmed">Mode Library</Text>
          </Group>
          <Badge variant="light" color="gray" size="sm">
            {modes.length}
          </Badge>
        </Group>

        <TextInput
          placeholder="Search modes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<Search className="h-3.5 w-3.5 text-muted-foreground/40" />}
          styles={{
            input: {
              height: '2.25rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '0.75rem',
            }
          }}
          className="w-full hover:bg-muted/50 rounded-xl transition-all"
        />

        <Button
          onClick={onAddNew}
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98]"
          leftSection={<Plus className="h-3.5 w-3.5 stroke-[3px]" />}
        >
          New Mode
        </Button>
      </Box>

      {/* List Area */}
      <ScrollArea className="flex-1">
        <Box className="p-3 pb-8 space-y-6">
          {/* System Modes */}
          {systemModes.length > 0 && (
            <Box className="space-y-2">
              <Group gap="xs" align="center" className="px-1" wrap="nowrap">
                <Box className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center">
                  <ShieldAlert className="h-2.5 w-2.5 text-primary" />
                </Box>
                <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-[0.1em]" c="primary.7">
                  System Core
                </Text>
                <Box className="h-[1px] flex-1 bg-border/40" />
              </Group>
              <Box className="space-y-1">
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Box key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-lg mb-1" />
                  ))
                ) : systemModes.map(renderModeItem)}
              </Box>
            </Box>
          )}

          {/* Custom Modes */}
          <Box className="space-y-2">
            <Group gap="xs" align="center" className="px-1" wrap="nowrap">
              <Box className="h-4 w-4 rounded bg-amber-500/10 flex items-center justify-center">
                <Settings2 className="h-2.5 w-2.5 text-amber-600" />
              </Box>
              <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-[0.1em]" c="orange.7">
                Custom Profiles
              </Text>
              <Box className="h-[1px] flex-1 bg-border/40" />
            </Group>
            <Box className="space-y-1">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <Box key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-lg mb-1" />
                ))
              ) : customModes.length > 0 ? (
                customModes.map(renderModeItem)
              ) : (
                <Box className="py-8 flex flex-col items-center justify-center text-center px-4 bg-muted/5 rounded-xl border border-dashed border-border/40">
                  <Box className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground/30" />
                  </Box>
                  <Text size="0.6rem" fw={700} tt="uppercase" className="tracking-widest leading-tight" c="dimmed">
                    No custom<br/>profiles found
                  </Text>
                  <Button 
                    variant="subtle"
                    size="xs" 
                    onClick={onAddNew}
                    className="h-auto p-0 text-[9px] font-black uppercase tracking-tighter mt-1"
                  >
                    Create first mode
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  );
}

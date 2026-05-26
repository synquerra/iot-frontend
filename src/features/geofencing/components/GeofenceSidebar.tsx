import { useState } from "react";
import { Search, Plus, MapPin, Trash2, Edit3 } from "lucide-react";
import { TextInput, Button, ActionIcon, Box, Text, Group, NavLink, ThemeIcon } from "@mantine/core";
import type { GeofenceRecord } from "../types";

interface GeofenceSidebarProps {
  geofences: GeofenceRecord[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  selectedId: string | null;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function GeofenceSidebar({
  geofences,
  onSelect,
  onAdd,
  onEdit,
  selectedId,
  onDelete,
  isLoading,
}: GeofenceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGeofences = geofences.filter((geo) => {
    return geo.geofence_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <Box className="flex flex-col h-full bg-background">
      <Box className="p-4 space-y-4 border-b border-border">
        {/* Search */}
        <TextInput
          placeholder="Search geofences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<Search size="0.8rem" className="text-muted-foreground" />}
        />

        <Button 
          fullWidth
          leftSection={<Plus size="1rem" />}
          onClick={onAdd}
          className="font-bold uppercase tracking-widest text-xs"
        >
          New Geofence
        </Button>
      </Box>

      <Box className="flex-1 overflow-y-auto">
        <Box className="px-4 py-2 border-b border-border bg-muted/10">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" className="tracking-wider">
            Geofence List ({filteredGeofences.length})
          </Text>
        </Box>
        
        {isLoading ? (
          <Box className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Box key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </Box>
        ) : filteredGeofences.length > 0 ? (
          <Box className="p-2 space-y-1">
            {filteredGeofences.map((geo) => {
              const isSelected = selectedId === geo.geofence_id;
              return (
                <Box key={geo.geofence_id} className="relative group mb-1">
                  <NavLink
                    active={isSelected}
                    onClick={() => onSelect(geo.geofence_id)}
                    label={
                      <Text size="sm" fw={700} className="truncate leading-none">
                        {geo.geofence_name}
                      </Text>
                    }
                    description={
                      <Group gap="xs" mt={4}>
                        {geo.flag && (
                          <Text span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-tight border border-border/50">
                            {geo.flag}
                          </Text>
                        )}
                        {geo.geofence_number && (
                          <Text span className="text-[10px] font-bold uppercase tracking-tight">
                            Slot {geo.geofence_number.replace("GEO", "")}
                          </Text>
                        )}
                      </Group>
                    }
                    leftSection={
                      <ThemeIcon variant={isSelected ? "filled" : "light"} color="indigo" radius="md">
                        <MapPin size={16} />
                      </ThemeIcon>
                    }
                    className="rounded-md pr-16"
                    variant="light"
                  />

                  <Group gap={2} className="absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(geo.geofence_id);
                      }}
                      title="Edit Geofence"
                    >
                      <Edit3 size="1rem" />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete) onDelete(geo.geofence_id);
                      }}
                      title="Delete Geofence"
                    >
                      <Trash2 size="1rem" />
                    </ActionIcon>
                  </Group>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="p-12 text-center text-muted-foreground">
            <Text size="sm" fw={500}>No geofences found</Text>
            <Text size="xs" mt={4}>Try adjusting your search query</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

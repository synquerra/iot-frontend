import { Skeleton, Button, Stack, Center, Text } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";
import { AlertItem } from "./AlertItem";
import type { HistoryItem } from "../types";

interface AlertsHistoryProps {
  loading: boolean;
  filteredItems: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  onAcknowledge: (id: string) => void;
  formatDate: (date: string) => string;
}

export function AlertsHistory({
  loading,
  filteredItems,
  searchQuery,
  setSearchQuery,
  isRefreshing,
  onAcknowledge,
  formatDate
}: AlertsHistoryProps) {
  return (
    <Stack gap="sm">
      {loading ? (
        <Stack gap="sm">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} h={64} radius="xl" />
          ))}
        </Stack>
      ) : filteredItems.length > 0 ? (
        <Stack gap="sm">
          {filteredItems.map((item) => (
            <AlertItem
              key={item.id}
              item={item}
              isRefreshing={isRefreshing}
              onAcknowledge={onAcknowledge}
              formatDate={formatDate}
            />
          ))}
        </Stack>
      ) : (
        <Center py={64} className="flex-col bg-muted/10 rounded-3xl border border-dashed border-border/50 text-center">
          <div className="rounded-full bg-muted/40 p-5 mb-4 border border-border/50">
            <CheckCircle2 size="2rem" className="text-muted-foreground opacity-40" />
          </div>
          <Text size="lg" fw={900} tt="uppercase" className="tracking-tighter">No active events</Text>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="max-w-sm mb-6 tracking-tight opacity-60">
            {searchQuery 
              ? "Try adjusting your filter parameters"
              : "The system is currently stable and all monitoring protocols are normal."}
          </Text>
          {searchQuery && (
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setSearchQuery("")}
              className="h-8 text-[10px] font-black uppercase tracking-widest rounded-full px-6"
            >
              Clear Filter
            </Button>
          )}
        </Center>
      )}
    </Stack>
  );
}

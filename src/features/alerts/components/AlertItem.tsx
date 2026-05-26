import { Badge, Text, Group, Box } from "@mantine/core";
import { Smartphone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "../types";

interface AlertItemProps {
  item: HistoryItem;
  isRefreshing: boolean;
  onAcknowledge: (id: string) => void;
  formatDate: (date: string) => string;
}

export function AlertItem({ item, isRefreshing, onAcknowledge, formatDate }: AlertItemProps) {
  const severityThemes: Record<string, string> = {
    critical: "bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-400",
    danger: "bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-400",
    warning: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
    caution: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
    advisory: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-400",
  };

  const theme = severityThemes[item.severity.toLowerCase()] || severityThemes.advisory;

  return (
    <Box
      className={cn(
        "group relative rounded-xl border transition-all duration-200 py-2.5 px-4",
        item.is_acknowledged ? "bg-muted/30 border-border opacity-50" : theme
      )}
    >
      <Group justify="space-between" align="center">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" mb={6} align="center">
            <Text size="sm" fw={900} className="tracking-tight truncate leading-none">
              {item.title}
            </Text>
            <Badge
              size="xs"
              variant={item.is_acknowledged ? "light" : "filled"}
              color={item.color}
              className="font-black uppercase h-4"
            >
              {item.severity}
            </Badge>
            <Badge 
              variant="default"
              size="xs"
              className="font-mono font-black"
            >
              {item.code}
            </Badge>
          </Group>

          <Group gap="md">
            <Group gap={4}>
              <Smartphone size="0.75rem" className="opacity-40" />
              <Text size="xs" fw={700} tt="uppercase" className="tracking-tight opacity-70" ff="monospace">
                {item.imei}
              </Text>
            </Group>
            <Group gap={4} className="border-l border-border pl-3">
              <Clock size="0.75rem" className="opacity-40" />
              <Text size="xs" fw={700} tt="uppercase" className="tracking-tight opacity-70">
                {formatDate(item.timestamp)}
              </Text>
            </Group>
          </Group>
        </Box>
      </Group>
    </Box>
  );
}

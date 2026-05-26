import { Card, Badge, Skeleton, SimpleGrid, Group, Text, Box } from "@mantine/core";
import { cn } from "@/lib/utils";
import type { SeverityCard } from "../types";

interface SeverityOverviewProps {
  cards: SeverityCard[];
  loading: boolean;
}

const severityConfig = {
  critical: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    cardBg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-900/50",
    badgeColor: "red",
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-600",
  },
  warning: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    cardBg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/50",
    badgeColor: "orange",
    icon: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-600",
  },
  advisory: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    cardBg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/50",
    badgeColor: "blue",
    icon: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-600",
  },
};

export function SeverityOverview({ cards, loading }: SeverityOverviewProps) {
  const getSeverityStyle = (label: string) => {
    const key = label.toLowerCase() as keyof typeof severityConfig;
    return severityConfig[key] || severityConfig.advisory;
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i} withBorder padding="lg" radius="md">
            <Skeleton h={16} w={80} mb="md" />
            <Skeleton h={36} w={64} mb="sm" />
            <Skeleton h={12} w={96} />
          </Card>
        ))
      ) : (
        cards.map((card) => {
          const CardIcon = card.icon;
          const severity = getSeverityStyle(card.label);

          return (
            <Card
              key={card.label}
              className={cn(
                "group relative overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md",
                severity.cardBg,
                severity.border
              )}
              padding="md"
              radius="md"
            >
              <Box className="relative z-10 flex flex-col gap-4">
                <Group justify="space-between" align="flex-start">
                  <Badge
                    color={severity.badgeColor}
                    size="sm"
                    radius="sm"
                    className="font-black px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
                  >
                    {card.label}
                  </Badge>

                  <div className={cn(
                    "rounded-lg p-2 border transition-all duration-300",
                    severity.bg,
                    severity.border
                  )}>
                    <CardIcon className={cn("h-4 w-4", severity.icon)} />
                  </div>
                </Group>

                <Group align="baseline" gap={6}>
                  <Text span className={cn("text-2xl font-black font-mono tracking-tighter", severity.text)}>
                    {card.count.toLocaleString()}
                  </Text>
                  <Text span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                    incidents
                  </Text>
                </Group>
              </Box>

              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300",
                severity.accent
              )} />
            </Card>
          );
        })
      )}
    </SimpleGrid>
  );
}
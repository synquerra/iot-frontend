import { Card, Box, Group, Text } from "@mantine/core";
import { cn } from "@/lib/utils";
import type { MetricCardProps } from "@/types";

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color = "primary",
  children,
}: MetricCardProps) {
  const solidBackgrounds: Record<string, string> = {
    blue: "bg-blue-600 border-blue-400/40 shadow-blue-900/20",
    sky: "bg-sky-500 border-sky-300/40 shadow-sky-900/20",
    slate: "bg-slate-700 border-slate-500/40 shadow-slate-950/30",
    orange: "bg-orange-600 border-orange-400/40 shadow-orange-900/20",
    red: "bg-red-600 border-red-400/40 shadow-red-900/20",
    emerald: "bg-emerald-600 border-emerald-400/40 shadow-emerald-900/20",
    purple: "bg-purple-600 border-purple-400/40 shadow-purple-900/20",
    primary: "bg-slate-900 border-slate-700 shadow-black/30",
  };

  const hoverGlows: Record<string, string> = {
    blue: "hover:shadow-blue-900/40",
    sky: "hover:shadow-sky-900/40",
    slate: "hover:shadow-slate-950/40",
    orange: "hover:shadow-orange-900/40",
    red: "hover:shadow-red-900/40",
    emerald: "hover:shadow-emerald-900/40",
    purple: "hover:shadow-purple-900/40",
    primary: "hover:shadow-black/40",
  };

  return (
    <Card radius="xl" padding={0} className={cn(
      "group relative transition-all duration-300 overflow-hidden border-2 h-full",
      "hover:shadow-xl hover:translate-y-[-4px] active:translate-y-0",
      solidBackgrounds[color] || solidBackgrounds.primary,
      hoverGlows[color] || hoverGlows.primary,
    )}>
      <Box className="absolute -right-4 -top-4 opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none rotate-6 scale-150 transform-gpu">
        <Icon className="h-24 w-24 text-white" />
      </Box>

      <Box className="p-4 md:p-5 relative z-10 flex flex-col justify-between h-full text-white">
        <Group gap="sm" align="center" wrap="nowrap">
          <Box
            className="rounded-xl p-2.5 transition-all duration-300 bg-white/15 group-hover:bg-white/25 group-hover:scale-105 shrink-0"
          >
            <Icon className="h-5 w-5" />
          </Box>
          <Text size="0.65rem" fw={900} tt="uppercase" className="tracking-[0.2em] text-white/85">
            {label}
          </Text>
        </Group>

        <Box className="space-y-0 mt-4">
          <Group gap={6} align="baseline" wrap="nowrap" className="overflow-hidden">
            <Text size="1.875rem" fw={900} ff="monospace" className="tracking-tighter leading-none drop-shadow-sm truncate text-white">
              {value}
            </Text>
            {unit && (
              <Text size="0.65rem" fw={900} tt="uppercase" className="text-white/70 tracking-widest leading-none shrink-0">
                {unit}
              </Text>
            )}
          </Group>
        </Box>

        {children && <Box className="mt-4 pt-4 border-t border-white/15">{children}</Box>}
      </Box>
    </Card>
  );
}
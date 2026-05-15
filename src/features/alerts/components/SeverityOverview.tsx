import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    badge: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-600",
  },
  warning: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    cardBg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/50",
    badge: "bg-amber-600 text-white dark:bg-amber-500 dark:text-white",
    icon: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-600",
  },
  advisory: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    cardBg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/50",
    badge: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden border-border bg-card">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
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
            >
              <CardContent className="p-4">
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <Badge
                      className={cn(
                        "font-black border-0 px-2.5 py-0.5 text-[10px] uppercase tracking-wider",
                        severity.badge
                      )}
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
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className={cn("text-2xl font-black font-mono tracking-tighter", severity.text)}>
                      {card.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                      incidents
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300",
                severity.accent
              )} />
            </Card>
          );
        })
      )}
    </div>
  );
}
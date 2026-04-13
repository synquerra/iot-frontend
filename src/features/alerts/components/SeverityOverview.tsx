import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SeverityCard } from "../types";

interface SeverityOverviewProps {
  cards: SeverityCard[];
  loading: boolean;
}

// Severity color configuration for 3 levels with dark mode support
const severityConfig = {
  critical: {
    light: "bg-red-50 text-red-700 border-red-200",
    dark: "dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    icon: "text-red-600 dark:text-red-400",
    bar: "bg-gradient-to-r from-red-500 to-red-600",
    hover: "hover:border-red-200 dark:hover:border-red-800",
  },
  warning: {
    light: "bg-amber-50 text-amber-700 border-amber-200",
    dark: "dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
    bar: "bg-gradient-to-r from-amber-500 to-amber-600",
    hover: "hover:border-amber-200 dark:hover:border-amber-800",
  },
  advisory: {
    light: "bg-blue-50 text-blue-700 border-blue-200",
    dark: "dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400",
    bar: "bg-gradient-to-r from-blue-500 to-blue-600",
    hover: "hover:border-blue-200 dark:hover:border-blue-800",
  },
};

export function SeverityOverview({ cards, loading }: SeverityOverviewProps) {
  const getSeverityStyle = (label: string) => {
    const key = label.toLowerCase() as keyof typeof severityConfig;
    return severityConfig[key] || severityConfig.advisory;
  };

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
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
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1",
                "border bg-card",
                severity.hover
              )}
            >
              <CardContent className="p-6">
                <div className="relative z-10">
                  {/* Header with badge and icon */}
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-semibold border-0 px-3 py-1 uppercase tracking-wide",
                        severity.badge
                      )}
                    >
                      {card.label}
                    </Badge>

                    <div className={cn(
                      "rounded-xl p-2.5 transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-md",
                      severity.light,
                      severity.dark
                    )}>
                      <CardIcon className={cn("h-5 w-5", severity.icon)} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight">
                        {card.count.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        events
                      </span>
                    </div>

                  </div>
                </div>
              </CardContent>

              {/* Animated bottom bar */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300",
                "group-hover:h-1.5",
                severity.bar
              )} />
            </Card>
          );
        })
      )}
    </div>
  );
}
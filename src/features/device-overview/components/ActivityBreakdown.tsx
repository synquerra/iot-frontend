import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Footprints, Pause, TrendingUp } from "lucide-react";

interface ActivityBreakdownProps {
  crawling: number;
  stationary: number;
  overspeeding: number;
}

export function ActivityBreakdown({
  crawling,
  stationary,
  overspeeding,
}: ActivityBreakdownProps) {
  const total = crawling + stationary + overspeeding;

  const items = [
    {
      label: "Crawling",
      value: crawling,
      icon: Footprints,
      color: "blue",
      theme: {
        bg: "bg-blue-600",
        iconBg: "bg-blue-500/20",
        icon: "text-blue-100",
        border: "border-blue-400/30",
        accent: "bg-blue-400"
      },
      percentage: total > 0 ? (crawling / total) * 100 : 0
    },
    {
      label: "Stationary",
      value: stationary,
      icon: Pause,
      color: "orange",
      theme: {
        bg: "bg-orange-600",
        iconBg: "bg-orange-500/20",
        icon: "text-orange-100",
        border: "border-orange-400/30",
        accent: "bg-orange-400"
      },
      percentage: total > 0 ? (stationary / total) * 100 : 0
    },
    {
      label: "Overspeeding",
      value: overspeeding,
      icon: TrendingUp,
      color: "red",
      theme: {
        bg: "bg-red-600",
        iconBg: "bg-red-500/20",
        icon: "text-red-100",
        border: "border-red-400/30",
        accent: "bg-red-400"
      },
      percentage: total > 0 ? (overspeeding / total) * 100 : 0
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="p-4 border-b border-border bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Activity Analysis</CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">Live movement distribution</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-4",
                "hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0",
                item.theme.bg,
                item.theme.border
              )}
            >
              <div className="absolute -right-3 -top-3 opacity-[0.08] group-hover:opacity-[0.12] transition-all duration-500 pointer-events-none rotate-6 scale-150">
                <item.icon className="h-20 w-20 text-white" />
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "rounded-lg p-2 border transition-all duration-300 group-hover:scale-110",
                    item.theme.iconBg,
                    item.theme.border
                  )}>
                    <item.icon className={cn("h-4 w-4", item.theme.icon)} />
                  </div>
                  <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black border bg-white/10 text-white">
                    {item.percentage.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono tracking-tight text-white leading-none drop-shadow-sm">{item.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">
                    {item.label}
                  </p>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className={cn("h-full transition-all duration-700 ease-out", item.theme.accent)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Telemetry Insights</span>
            <div className="flex flex-wrap items-center gap-4">
              {items.map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", item.theme.accent.replace('bg-', 'bg-'))} />
                  <span className="text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
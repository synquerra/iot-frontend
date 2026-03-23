import { Button } from "@/components/ui/button";
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
  const items = [
    { label: "Crawling", value: crawling, icon: Footprints, color: "blue" },
    { label: "Stationary", value: stationary, icon: Pause, color: "orange" },
    {
      label: "Overspeeding",
      value: overspeeding,
      icon: TrendingUp,
      color: "red",
    },
  ];

  const colorStyles: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>Last 24 hours monitoring</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.label}
                  </p>
                </div>
                <div
                  className={cn("rounded-full p-2", colorStyles[item.color].bg)}
                >
                  <item.icon
                    className={cn("h-4 w-4", colorStyles[item.color].text)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

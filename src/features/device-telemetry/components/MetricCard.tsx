import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "rounded-full p-3 group-hover:scale-110 transition-transform",
              `bg-${color}-500/10`,
            )}
          >
            <Icon className={cn("h-5 w-5", `text-${color}-500`)} />
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

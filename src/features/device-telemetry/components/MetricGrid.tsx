import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity,
  Battery,
  MapPin,
  Move,
  Navigation,
  Satellite,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface MetricsGridProps {
  speed: number;
  latitude: number;
  longitude: number;
  battery: number;
  signal: number;
  satellites: number;
  steps: number;
  distance: string;
}

export function MetricsGrid({
  speed,
  latitude,
  longitude,
  battery,
  signal,
  satellites,
  steps,
  distance,
}: MetricsGridProps) {
  const getSignalStrength = (signal: number) => {
    if (signal >= 80) return 4;
    if (signal >= 60) return 3;
    if (signal >= 40) return 2;
    if (signal >= 20) return 1;
    return 0;
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Move}
        label="Movement"
        value={speed}
        unit="km/h"
        color="blue"
      >
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-mono">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </div>
      </MetricCard>

      <MetricCard
        icon={Battery}
        label="Battery"
        value={battery}
        unit="%"
        color="yellow"
      >
        <div className="mt-4 space-y-2">
          <Progress
            value={battery}
            className="h-2"
            indicatorClassName={cn(
              battery > 60
                ? "bg-green-500"
                : battery > 20
                  ? "bg-yellow-500"
                  : "bg-red-500",
            )}
          />
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>≈ 3 hours remaining</span>
            <span className="font-mono">{battery}%</span>
          </p>
        </div>
      </MetricCard>

      <MetricCard
        icon={Wifi}
        label="Signal"
        value={signal}
        unit="%"
        color="purple"
      >
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-6 rounded-full transition-all",
                  i < getSignalStrength(signal) ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Satellite className="h-3.5 w-3.5" />
            <span>{satellites} SAT</span>
          </div>
        </div>
      </MetricCard>

      <MetricCard
        icon={Activity}
        label="Activity"
        value={steps.toLocaleString()}
        unit="steps"
        color="green"
      >
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-xs">
            <Navigation className="h-3.5 w-3.5" />
            <span>{distance} km today</span>
          </div>
          <Badge variant="outline" className="text-xs">
            +12% <TrendingUp className="h-3 w-3 ml-1 inline" />
          </Badge>
        </div>
      </MetricCard>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock4, Cpu, Thermometer } from "lucide-react";

interface DeviceHealthCardProps {
  temperature: number;
  performance: number;
  dataInterval: string;
}

export function DeviceHealthCard({
  temperature,
  performance,
  dataInterval,
}: DeviceHealthCardProps) {
  const items = [
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${temperature}°C`,
      color: "blue",
    },
    {
      icon: Cpu,
      label: "Performance",
      value: `${performance}%`,
      progress: performance,
      color: "green",
    },

    {
      icon: Clock4,
      label: "Data Interval",
      value: `${dataInterval}s`,
      color: "orange",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Device Health</CardTitle>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon
                    className={cn("h-4 w-4", `text-${item.color}-500`)}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
              {item.progress !== undefined && (
                <Progress value={item.progress} className="h-1.5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

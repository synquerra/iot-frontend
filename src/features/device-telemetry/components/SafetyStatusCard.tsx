import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, Shield } from "lucide-react";

interface SafetyStatusCardProps {
  alert: string;
  currentMode: string;
  firmware: string;
  ram: number;
  safetyEvents: number;
}

export function SafetyStatusCard({
  alert,
  currentMode,
  firmware,
  ram,
  safetyEvents,
}: SafetyStatusCardProps) {
  const items = [
    {
      label: "Alert Level",
      value: alert,
      variant: alert === "SOS" ? "destructive" : "secondary",
    },
    { label: "Current Mode", value: currentMode, icon: Shield },
    { label: "Firmware", value: firmware, icon: Cpu },
    { label: "RAM Usage", value: `${ram}%`, progress: ram },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Safety Status</CardTitle>
          <Badge variant="outline" className="text-xs">
            {safetyEvents} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              {item.variant ? (
                <Badge variant={item.variant as any}>
                  {String(item.value)}
                </Badge>
              ) : item.progress !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {String(item.value)}
                  </span>
                  <Progress value={item.progress} className="w-16 h-1.5" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {item.icon && <item.icon className="h-3.5 w-3.5" />}
                  <span className="text-sm font-medium">
                    {String(item.value)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

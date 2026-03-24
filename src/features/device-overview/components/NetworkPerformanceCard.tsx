import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, Signal, Wifi } from "lucide-react";

interface NetworkPerformanceCardProps {
  gpsSignal: number;
  signal: number;
}

export function NetworkPerformanceCard({
  gpsSignal,
  signal,
}: NetworkPerformanceCardProps) {
  return (
    <Card className="relative opacity-60 grayscale-[0.5] transition-all hover:grayscale-0 pointer-events-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Network Performance</CardTitle>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">Dummy</span>
        </div>
        <CardDescription>Signal strength and connectivity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-green-500" />
                GPS Signal
              </span>
              <span className="font-medium">{gpsSignal}%</span>
            </div>
            <Progress value={gpsSignal} className="h-2" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" />
                Network Signal
              </span>
              <span className="font-medium">{signal}%</span>
            </div>
            <Progress value={signal} className="h-2" />
          </div>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">4G/LTE</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

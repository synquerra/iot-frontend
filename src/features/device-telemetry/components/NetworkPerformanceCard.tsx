import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, Satellite, Signal, Wifi } from "lucide-react";

interface NetworkPerformanceCardProps {
  gpsSignal: number;
  signal: number;
  satellites: number;
}

export function NetworkPerformanceCard({
  gpsSignal,
  signal,
  satellites,
}: NetworkPerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Performance</CardTitle>
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
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">4G/LTE</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Satellite className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{satellites} Satellites</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

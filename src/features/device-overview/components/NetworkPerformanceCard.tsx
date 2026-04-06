import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Signal } from "lucide-react";

interface NetworkPerformanceCardProps {
  gpsSignal: number;
  gpsSignalRaw?: string;
  signal: number;
}

export function NetworkPerformanceCard({
  gpsSignal,
  gpsSignalRaw,
  signal,
}: NetworkPerformanceCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>GPS Performance</CardTitle>
        </div>
        <CardDescription>GPS signal quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-green-500" />
                GPS Strength
              </span>
              <span className="font-medium">{gpsSignalRaw || `${gpsSignal}%`}</span>
            </div>
            <Progress value={gpsSignal} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

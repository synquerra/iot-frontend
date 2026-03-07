import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeviceInfoSummaryProps {
  imei: string;
  firmware: string;
}

export function DeviceInfoSummary({ imei, firmware }: DeviceInfoSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Device Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">IMEI</span>
            <span className="font-mono font-medium">{imei}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium">GT-1000</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Firmware</span>
            <span className="font-medium">{firmware}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Last Calibration</span>
            <span className="font-medium">2024-12-01</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

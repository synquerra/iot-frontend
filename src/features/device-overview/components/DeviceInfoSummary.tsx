import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeviceInfoSummaryProps {
  imei: string;
}

export function DeviceInfoSummary({ imei }: DeviceInfoSummaryProps) {
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
        </div>
      </CardContent>
    </Card>
  );
}

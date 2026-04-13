import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Activity, Zap, Plane, Settings2, Thermometer } from "lucide-react";

export type DeviceSettingsSummaryProps = {
  normalInterval?: string;
  sosInterval?: string;
  speedLimit?: string;
  lowBattery?: string;
  airplaneInterval?: string;
  temperatureLimit?: string;
};

function SettingRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium text-sm text-foreground">{value}</span>
    </div>
  );
}

export function DeviceSettingsSummaryCard({
  normalInterval = "N/A",
  sosInterval = "N/A",
  speedLimit = "N/A",
  lowBattery = "N/A",
  airplaneInterval = "N/A",
  temperatureLimit = "N/A",
}: DeviceSettingsSummaryProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Active Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-5">
        <div className="flex flex-col">
          <SettingRow icon={Clock} label="Ping Interval" value={normalInterval} />
          <SettingRow icon={Activity} label="SOS Interval" value={sosInterval} />
          <SettingRow icon={Plane} label="Airplane Mode" value={airplaneInterval} />
          <SettingRow icon={Zap} label="Low Battery Alert" value={lowBattery} />
          <SettingRow icon={Thermometer} label="Temperature Limit" value={temperatureLimit} />
          <SettingRow icon={Activity} label="Speed Limit" value={speedLimit} />
        </div>
      </CardContent>
    </Card>
  );
}

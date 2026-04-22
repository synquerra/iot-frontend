import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Activity, Zap, Plane, Settings2, Thermometer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceSettingsSummaryProps = {
  normalInterval?: string;
  sosInterval?: string;
  speedLimit?: string;
  lowBattery?: string;
  airplaneInterval?: string;
  temperatureLimit?: string;
};

function SettingRow({ 
  icon: Icon, 
  label, 
  value, 
  unit 
}: { 
  icon: any; 
  label: string; 
  value: string;
  unit?: string;
}) {
  const isNA = value === "N/A" || !value;
  
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-border/40 group/row">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-1.5 bg-muted/50 group-hover/row:bg-primary/10 transition-colors">
          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover/row:text-primary transition-colors" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "font-mono text-sm font-black tracking-tight",
          isNA ? "text-muted-foreground/40" : "text-foreground"
        )}>
          {value}
        </span>
        {!isNA && unit && (
          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
            {unit}
          </span>
        )}
      </div>
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
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Active Configuration</CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Current hardware state</p>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-500 opacity-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-5 pb-4">
        <div className="flex flex-col">
          <SettingRow icon={Clock} label="Ping Interval" value={normalInterval} unit="s" />
          <SettingRow icon={Activity} label="SOS Interval" value={sosInterval} unit="s" />
          <SettingRow icon={Plane} label="Airplane Mode" value={airplaneInterval} unit="s" />
          <SettingRow icon={Zap} label="Low Battery Alert" value={lowBattery} unit="%" />
          <SettingRow icon={Thermometer} label="Thermal Limit" value={temperatureLimit} unit="°C" />
          <SettingRow icon={Activity} label="Velocity Cap" value={speedLimit} unit="km/h" />
        </div>
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bluetooth, Eye, Mic, WifiOff } from "lucide-react";

interface DeviceSettingsProps {
  audioRecording: boolean;
  aeroplaneMode: boolean;
  ble: boolean;
  ledStatus: boolean;
}

export function DeviceSettings({
  audioRecording,
  aeroplaneMode,
  ble,
  ledStatus,
}: DeviceSettingsProps) {
  const settings = [
    { icon: Mic, label: "Audio Recording", active: audioRecording },
    {
      icon: WifiOff,
      label: "Aeroplane Mode",
      active: aeroplaneMode,
      destructive: true,
    },
    { icon: Bluetooth, label: "Bluetooth LE", active: ble },
    { icon: Eye, label: "LED Status", active: ledStatus },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Settings</CardTitle>
        <CardDescription>Current configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.label}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    setting.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <setting.icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{setting.label}</span>
              </div>
              <Badge
                variant={setting.active ? "default" : "secondary"}
                className={cn(
                  setting.destructive &&
                    setting.active &&
                    "bg-destructive text-destructive-foreground",
                )}
              >
                {setting.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

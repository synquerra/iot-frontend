import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Gauge } from "lucide-react";
import { modeItems } from "../constants";

export function ModesSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          Device Modes
        </CardTitle>
        <CardDescription>Enable or disable device features</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modeItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.iconContainerClassName}`}>
                  <item.icon className={`h-4 w-4 ${item.iconClassName}`} />
                </div>

                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              <Switch defaultChecked={item.enabled} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

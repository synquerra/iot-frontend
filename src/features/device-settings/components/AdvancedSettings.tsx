import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { featureToggleItems, powerItems } from "../constants";

export function AdvancedSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Advanced Settings
        </CardTitle>
        <CardDescription>
          Configure advanced device parameters
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feature Toggles</h3>

            {featureToggleItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Power Management</h3>

            {powerItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.input ? (
                  <Input className="h-8 w-20" defaultValue={item.value} />
                ) : (
                  <Switch defaultChecked={item.enabled} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

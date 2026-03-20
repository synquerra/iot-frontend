import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gauge, RotateCcw, Shield, Thermometer } from "lucide-react";

const safetyFields = [
  {
    title: "Temperature Limit",
    icon: Thermometer,
    iconClassName: "text-red-500",
    unit: "°C",
    defaultValue: "30",
    description: "Alert when temperature exceeds limit",
  },
  {
    title: "Speed Limit",
    icon: Gauge,
    iconClassName: "text-blue-500",
    unit: "km/h",
    defaultValue: "60",
    description: "Alert when speed exceeds limit",
  },
];

export function SafetySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Safety Parameters
        </CardTitle>
        <CardDescription>
          Configure safety thresholds and limits
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {safetyFields.map((field) => (
            <div key={field.title} className="space-y-4 rounded-lg bg-muted p-6">
              <div className="flex items-center gap-2">
                <field.icon className={`h-5 w-5 ${field.iconClassName}`} />
                <h3 className="font-semibold">{field.title}</h3>
              </div>

              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  defaultValue={field.defaultValue}
                  className="w-24"
                />
                <span className="text-lg">{field.unit}</span>
              </div>

              <p className="text-sm text-muted-foreground">{field.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" className="gap-2 text-primary">
            <RotateCcw size={16} />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

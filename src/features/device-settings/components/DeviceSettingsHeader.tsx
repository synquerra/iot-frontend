import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";

export function DeviceSettingsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Device Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure and manage your device parameters
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2 hover:bg-red-400" disabled>
          <RotateCcw size={16} />
          Reset All
        </Button>

        <Button className="gap-2">
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

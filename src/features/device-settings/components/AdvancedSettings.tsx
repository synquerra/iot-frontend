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
import { featureToggleItems, powerItems, deprecatedItems } from "../constants";
import { cn } from "@/lib/utils";

type AdvancedSettingsProps = {
  selectedImei: string;
};

export function AdvancedSettings({ selectedImei }: AdvancedSettingsProps) {
  const isEnabled = Boolean(selectedImei);
  const commsSettings = [...powerItems.filter(i => i.label.includes("Call")), ...featureToggleItems.filter(i => i.label.includes("Call"))];
  const systemSettings = powerItems.filter(i => !i.label.includes("Call"));

  return (
    <Card className={cn(
      "border-primary/10 shadow-sm transition-opacity duration-300",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Advanced System Configuration
        </CardTitle>
        <CardDescription>
          {!isEnabled 
            ? "Select a device to fine-tune operational parameters" 
            : "Fine-tune device operation and connectivity parameters"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="space-y-12">
          {/* Main Controls Grid */}
          <div className="grid gap-12 md:grid-cols-2">
            
            {/* Communication Controls */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Communication Controls</h3>
              </div>
              <div className="space-y-2">
                {commsSettings.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl p-4 bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {'enabled' in item && <Switch defaultChecked={item.enabled} />}
                  </div>
                ))}
              </div>
            </div>

            {/* System Parameters */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-orange-500 rounded-full" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">System Parameters</h3>
              </div>
              <div className="space-y-2">
                {systemSettings.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl p-4 bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-500/10 p-2">
                        <item.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.input ? (
                      <Input className="h-8 w-20 bg-background/50 text-xs font-black text-center" defaultValue={item.value} />
                    ) : (
                      <Switch defaultChecked={item.enabled} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deprecated/Restricted Subsection */}
          <div className="pt-10 mt-10 border-t border-dashed relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-background text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
              Restricted Maintenance Access
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {deprecatedItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-background/50 p-1.5 border border-border/50">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground tracking-tight leading-tight">{item.label}</p>
                  </div>
                  <Switch disabled defaultChecked={false} className="scale-75 origin-right" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

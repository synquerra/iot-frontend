import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Phone,
  Plane,
  Settings,
  SunMedium,
  Radio,
  Zap,
  CheckCircle2,
  XCircle,
  Square,
  RefreshCw,
  Search,
  FlaskConical
} from "lucide-react";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "sonner";
import { updateAirplaneMode, updateLedStatus } from "@/features/device-settings/services/deviceSettingsService";
import { cn } from "@/lib/utils";

interface TestingActionCenterProps {
  topic?: string | null;
  currentMode?: string | null;
  ledStatus?: string | null;
}

export function TestingActionCenter({ topic, currentMode, ledStatus }: TestingActionCenterProps) {
  const { setIsLoading } = useGlobalLoading();

  const handleAirplaneEnable = async () => {
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsLoading(true, "Activating flight mode...");
      const response = await updateAirplaneMode({ topic });
      if (response.status === "success") {
        toast.success(response.message || "Airplane mode enabled");
      } else {
        toast.error(response.message || "Failed to update airplane mode");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLedToggle = async (on: boolean) => {
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsLoading(true, `Switching LED ${on ? "ON" : "OFF"}...`);
      const response = await updateLedStatus({
        topic,
        LED: on ? "SwitchOnLed" : "SwitchOffLed",
      });
      if (response.status === "success") {
        toast.success(response.message || `LED ${on ? "switched on" : "switched off"}`);
      } else {
        toast.error(response.message || "Failed to update LED status");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isAirplaneEnabled = currentMode === "Airplane" || currentMode === "AirplaneMode";
  const isLedOn = ledStatus === "SwitchOnLed" || ledStatus === "on";

  return (
    <Card className="border-border shadow-sm h-full flex flex-col bg-card rounded-xl">
      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Hardware Diagnostics</CardTitle>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Engineering Control Center</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LED Indicator */}
          <ActionCard
            label="LED Indicator"
            icon={<SunMedium className="h-4 w-4" />}
            isActive={isLedOn}
            statusText={isLedOn ? "Active" : "Disabled"}
          >
            <div className="flex items-center justify-end pt-2">
              <Switch checked={isLedOn} onCheckedChange={handleLedToggle} className="data-[state=checked]:bg-primary" />
            </div>
          </ActionCard>

          {/* Aeroplane Mode */}
          <ActionCard
            label="Airplane Mode"
            icon={<Plane className="h-4 w-4" />}
            isActive={isAirplaneEnabled}
            statusText={isAirplaneEnabled ? "Active" : "Ready"}
          >
            <div className="flex items-center justify-end pt-2">
              <Button
                size="sm"
                disabled={isAirplaneEnabled}
                onClick={handleAirplaneEnable}
                className="h-7 font-bold text-[9px] uppercase tracking-wider px-3"
              >
                {isAirplaneEnabled ? "Locked" : "Enable"}
              </Button>
            </div>
          </ActionCard>

          {/* Call Enable - DISABLED */}
          <ActionCard
            label="Call Enable"
            icon={<Phone className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <div className="flex items-center justify-end pt-2">
              <Switch disabled className="scale-75" />
            </div>
          </ActionCard>

          {/* Ambient - DISABLED */}
          <ActionCard
            label="Ambient"
            icon={<Radio className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <div className="flex items-center justify-end pt-2">
              <Switch disabled className="scale-75" />
            </div>
          </ActionCard>

          {/* GPS Enable - DISABLED */}
          <ActionCard
            label="GPS Service"
            icon={<Settings className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <div className="flex items-center justify-end pt-2">
              <Switch disabled className="scale-75" />
            </div>
          </ActionCard>

          {/* SMS Enable - DISABLED */}
          <ActionCard
            label="SMS Gateway"
            icon={<Zap className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <div className="flex items-center justify-end pt-2">
              <Switch disabled className="scale-75" />
            </div>
          </ActionCard>

          {/* Stop SOS - DISABLED */}
          <ActionCard
            label="Kill SOS"
            icon={<Square className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <Button variant="destructive" size="sm" className="w-full h-7 font-bold text-[9px] uppercase mt-2" disabled>
              Stop SOS
            </Button>
          </ActionCard>

          {/* RESET - DISABLED */}
          <ActionCard
            label="Reboot Unit"
            icon={<RefreshCw className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <Button variant="secondary" size="sm" className="w-full h-7 font-bold text-[9px] uppercase mt-2 bg-yellow-500/10 text-yellow-600 border-none hover:bg-yellow-500/20" disabled>
              RESET
            </Button>
          </ActionCard>

          {/* Get Packet - DISABLED */}
          <ActionCard
            label="Query Packet"
            icon={<Search className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <Button variant="secondary" size="sm" className="w-full h-7 font-bold text-[9px] uppercase mt-2 bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/20" disabled>
              Pull Data
            </Button>
          </ActionCard>

          {/* Stop Ambient - DISABLED */}
          <ActionCard
            label="Stop Ambient"
            icon={<Radio className="h-4 w-4" />}
            isDisabled
            statusText="Restricted"
          >
            <Button variant="secondary" size="sm" className="w-full h-7 font-bold text-[9px] uppercase mt-2 bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/20" disabled>
              Cease Mic
            </Button>
          </ActionCard>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  label,
  icon,
  isActive,
  isDisabled,
  statusText,
  children
}: {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  statusText: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "space-y-4 rounded-xl border p-4 transition-all relative overflow-hidden",
      isActive ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20",
      isDisabled && "opacity-50 bg-muted/20 border-dashed"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-lg p-2 border",
          isActive ? "bg-primary/20 border-primary/30" : "bg-muted border-border",
          isDisabled && "bg-muted/50 border-muted-foreground/10"
        )}>
          <div className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")}>
            {icon}
          </div>
        </div>
        <div>
          <p className="font-bold text-xs">{label}</p>
          <div className="flex items-center gap-1">
            {isActive ? (
              <CheckCircle2 className="h-3 w-3 text-primary" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground/40" />
            )}
            <p className={cn("text-[9px] font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
              {statusText}
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

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
} from "lucide-react";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "sonner";
import { updateAirplaneMode, updateLedStatus } from "@/features/device-settings/services/deviceSettingsService";

interface TestingActionCenterProps {
  topic?: string | null;
  currentMode?: string | null;
  ledStatus?: string | null;
}

export function TestingActionCenter({ topic, currentMode, ledStatus }: TestingActionCenterProps) {
  const { setIsLoading } = useGlobalLoading();

  const handleAirplaneToggle = async (enable: boolean) => {
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsLoading(true, "Please wait");
      const response = await updateAirplaneMode({
        topic,
        AirplaneMode: enable ? "enable" : "disable",
      });
      if (response.status === "success") {
        toast.success(response.message || `Airplane mode ${enable ? "enabled" : "disabled"}`);
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
      setIsLoading(true, "Please wait");
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

  const handleAction = async (actionName: string) => {
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsLoading(true, "Please wait");
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`${actionName} command dispatched`);
    } catch {
      toast.error("Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isAirplaneEnabled = currentMode === "Airplane" || currentMode === "AirplaneMode";
  const isLedOn = ledStatus === "SwitchOnLed" || ledStatus === "on";

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-primary/5">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Action Center
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <ToggleItem 
            label="LED Status" 
            icon={<SunMedium className="h-3 w-3" />} 
            checked={isLedOn} 
            onChange={handleLedToggle}
          />
          <ToggleItem 
            label="Aeroplane" 
            icon={<Plane className="h-3 w-3" />} 
            checked={isAirplaneEnabled} 
            onChange={handleAirplaneToggle}
          />
          <ToggleItem label="Call Enable" icon={<Phone className="h-3 w-3" />} />
          <ToggleItem label="Ambient" icon={<Radio className="h-3 w-3" />} />
          <ToggleItem label="GPS Enable" icon={<Settings className="h-3 w-3" />} />
          <ToggleItem label="SMS Enable" icon={<Zap className="h-3 w-3" />} />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
           <Button onClick={() => handleAction("Stop SOS")} variant="destructive" className="h-10 font-bold shadow-md uppercase tracking-wider text-[10px]" disabled>
              Stop SOS
           </Button>
           <Button onClick={() => handleAction("Stop Ambient")} className="h-10 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md uppercase tracking-wider text-[10px]" disabled>
              Stop Ambient
           </Button>
           <Button onClick={() => handleAction("Get Packet")} className="h-10 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md uppercase tracking-wider text-[10px]" disabled>
              Get Packet
           </Button>
           <Button onClick={() => handleAction("Reset")} className="h-10 font-bold bg-yellow-500 hover:bg-yellow-600 text-white shadow-md uppercase tracking-wider text-[10px]" disabled>
              RESET
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleItem({ label, icon, checked, onChange }: { label: string; icon: React.ReactNode; checked?: boolean; onChange?: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-muted/40 p-2 px-3 rounded-md border border-primary/5 hover:border-primary/10 transition-all opacity-60">
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-primary">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-tight truncate">{label}</span>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange}
        className="scale-75" 
        disabled
      />
    </div>
  );
}

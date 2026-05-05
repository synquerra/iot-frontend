import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Phone,
  Plane,
  SunMedium,
  Square,
  Search,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Mic,
  StopCircle
} from "lucide-react";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "sonner";
import { 
  updateAirplaneMode, 
  updateLedStatus,
  toggleIncomingCalls,
  toggleAmbientListening
} from "@/features/device-settings/services/deviceSettingsService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TestingActionCenterProps {
  imei?: string | null;
  topic?: string | null;
  currentMode?: string | null;
  ledStatus?: string | null;
  incomingCallEnabled?: boolean | null;
  ambientListeningStatus?: string | null;
}

export function TestingActionCenter({ imei, topic, currentMode, ledStatus, incomingCallEnabled, ambientListeningStatus: propStatus }: TestingActionCenterProps) {
  const { setIsLoading } = useGlobalLoading();
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  // Sync local status when prop changes
  useEffect(() => {
    setLocalStatus(null);
  }, [propStatus]);

  const ambientListeningStatus = localStatus ?? propStatus;

  const handleToggleIncomingCalls = async (on: boolean) => {
    if (!imei) {
      toast.error("Device IMEI is missing.");
      return;
    }
    try {
      const action = on ? "Enable" : "Disable";
      setIsLoading(true, `${on ? "Enabling" : "Disabling"} incoming calls...`);
      const response = await toggleIncomingCalls({ 
        imei, 
        status: action 
      });
      if (response.status === "success") {
        toast.success(response.message || `Incoming calls ${on ? "enabled" : "disabled"}`);
      } else {
        toast.error(response.message || `Failed to ${on ? "enable" : "disable"} incoming calls`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAmbient = async (status: "Enable" | "Disable" | "Stop") => {
    if (!imei) {
      toast.error("Device IMEI is missing.");
      return;
    }
    try {
      setIsLoading(true, `Requesting ambient listening ${status}...`);
      const response = await toggleAmbientListening({ 
        imei, 
        status 
      });
      if (response.status === "success") {
        toast.success(response.message || `Ambient listening ${status} requested`);
        // Match toggle state based on response data
        if (response.data?.status) {
          setLocalStatus(response.data.status);
        }
      } else {
        toast.error(response.message || `Failed to ${status} ambient listening`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h3 className="text-md font-bold tracking-tight">System Testing</h3>
        </div>
        <Badge 
          variant={topic ? "secondary" : "destructive"} 
          className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5"
        >
          {topic ? "Link Active" : "No Link"}
        </Badge>
      </CardHeader>
      <Separator className="mt-4" />
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* LED Toggle */}
          <TestingItem 
            label="LED Status" 
            icon={<SunMedium className="h-3.5 w-3.5" />} 
            status={isLedOn ? "ON" : "OFF"}
            isActive={isLedOn}
          >
            <Switch checked={isLedOn} onCheckedChange={handleLedToggle} />
          </TestingItem>

          {/* Airplane Mode */}
          <TestingItem 
            label="Airplane" 
            icon={<Plane className="h-3.5 w-3.5" />} 
            status={isAirplaneEnabled ? "ACTIVE" : "READY"}
            isActive={isAirplaneEnabled}
          >
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isAirplaneEnabled} 
              onClick={handleAirplaneEnable}
              className="h-7 text-[10px] font-bold uppercase"
            >
              {isAirplaneEnabled ? "Locked" : "Enable"}
            </Button>
          </TestingItem>

          {/* Incoming Calls Toggle */}
          <TestingItem 
            label="Incoming Calls" 
            icon={<Phone className="h-3.5 w-3.5" />} 
            status={incomingCallEnabled ? "READY" : "LOCKED"}
            isActive={!!incomingCallEnabled}
          >
            <Switch 
              checked={!!incomingCallEnabled} 
              onCheckedChange={handleToggleIncomingCalls} 
            />
          </TestingItem>

          {/* Ambient Listening Control */}
          <TestingItem 
            label="Ambient Monitor" 
            icon={<Mic className="h-3.5 w-3.5" />} 
            status={ambientListeningStatus || "READY"}
            isActive={ambientListeningStatus === "Enable"}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                title={ambientListeningStatus === "Stop" ? "Already Stopped" : "Stop Monitoring"}
                onClick={() => handleToggleAmbient("Stop")}
                disabled={ambientListeningStatus === "Stop"}
              >
                <StopCircle className="h-4 w-4" />
              </Button>
              <Switch 
                checked={ambientListeningStatus === "Enable"} 
                onCheckedChange={(on) => handleToggleAmbient(on ? "Enable" : "Disable")} 
              />
            </div>
          </TestingItem>

          <TestingItem label="SOS Signal" icon={<Square className="h-3.5 w-3.5" />} status="LOCKED" isDisabled>
             <Badge variant="outline" className="text-[8px] opacity-50">DISABLED</Badge>
          </TestingItem>

          <TestingItem label="Data Query" icon={<Search className="h-3.5 w-3.5" />} status="LOCKED" isDisabled>
             <Badge variant="outline" className="text-[8px] opacity-50">DISABLED</Badge>
          </TestingItem>
        </div>

        {/* Action Logic Quick Reference */}
        <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-3.5 text-[7px] font-black bg-primary/10 border-primary/20 text-primary">ENABLE</Badge>
                <span className="text-[9px] font-bold uppercase text-muted-foreground/70 tracking-tighter">Live Monitor</span>
              </div>
              <p className="text-[9px] leading-tight text-muted-foreground/60 italic">Continuous record & stream 5m voice blocks.</p>
           </div>
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-3.5 text-[7px] font-black bg-muted border-border text-muted-foreground/60">DISABLE</Badge>
                <span className="text-[9px] font-bold uppercase text-muted-foreground/70 tracking-tighter">Passive Record</span>
              </div>
              <p className="text-[9px] leading-tight text-muted-foreground/60 italic">Stop stream, but keep 5m local recording.</p>
           </div>
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-3.5 text-[7px] font-black bg-destructive/10 border-destructive/20 text-destructive/80">STOP</Badge>
                <span className="text-[9px] font-bold uppercase text-muted-foreground/70 tracking-tighter">Hard Reset</span>
              </div>
              <p className="text-[9px] leading-tight text-muted-foreground/60 italic">Terminate all record, store & stream tasks.</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestingItem({ 
  label, 
  icon, 
  status, 
  isActive, 
  isDisabled, 
  children 
}: { 
  label: string; 
  icon: React.ReactNode; 
  status: string;
  isActive?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-all",
      isActive ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border",
      isDisabled && "opacity-50 grayscale border-dashed"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center border",
          isActive ? "bg-primary/20 border-primary/30 text-primary" : "bg-background border-border text-muted-foreground"
        )}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-tight leading-none mb-1">{label}</span>
          <div className="flex items-center gap-1">
             {isActive ? <CheckCircle2 className="h-2.5 w-2.5 text-primary" /> : <AlertCircle className="h-2.5 w-2.5 text-muted-foreground/50" />}
             <span className={cn("text-[9px] font-black tracking-widest", isActive ? "text-primary" : "text-muted-foreground")}>
               {status}
             </span>
          </div>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

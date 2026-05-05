import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Square, Mic, Info } from "lucide-react";
import { toggleAmbientListening } from "../services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AmbientListeningCardProps = {
  selectedImei?: string;
  ambientListeningStatus?: string | null;
};

export function AmbientListeningCard({ selectedImei, ambientListeningStatus: propStatus }: AmbientListeningCardProps) {
  const { setIsLoading } = useGlobalLoading();
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const isEnabled = Boolean(selectedImei);

  // Sync local status when prop changes
  useEffect(() => {
    setLocalStatus(null);
  }, [propStatus]);

  const ambientListeningStatus = localStatus ?? propStatus;

  const handleToggleAmbient = async (status: "Enable" | "Disable" | "Stop") => {
    if (!selectedImei) {
      toast.error("Device IMEI is missing.");
      return;
    }
    try {
      setIsLoading(true, `Requesting ambient listening ${status}...`);
      const response = await toggleAmbientListening({ 
        imei: selectedImei, 
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

  const isListening = ambientListeningStatus === "Enable";

  return (
    <Card className={cn(
      "border-primary/10 shadow-sm h-full flex flex-col transition-all",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="py-3 px-4 border-b border-border bg-muted/5 rounded-t-xl">
        <CardTitle className="text-sm font-bold uppercase tracking-tight">
          Ambient Listening
        </CardTitle>
        <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {!isEnabled 
            ? "Select device to view status" 
            : "Audio monitoring and control"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 py-6">
        <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border p-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "rounded-full p-2.5 transition-colors",
              isListening ? "bg-primary/20 text-primary animate-pulse" : "bg-muted text-muted-foreground"
            )}>
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight">Audio Monitor Status</p>
              <p className="text-xs text-muted-foreground/70">
                {isListening ? "Device is actively streaming audio" : "Monitoring is currently inactive"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Badge variant={isListening ? "default" : "outline"} className={cn(
               "text-[9px] font-black tracking-widest px-2 py-0.5",
               isListening ? "bg-primary text-white" : "text-muted-foreground/40"
             )}>
               {ambientListeningStatus || "READY"}
             </Badge>
             <Switch
               checked={isListening}
               onCheckedChange={(on) => handleToggleAmbient(on ? "Enable" : "Disable")}
               disabled={!isEnabled}
             />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="destructive"
            className="gap-2 h-auto py-4 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/10"
            onClick={() => handleToggleAmbient("Stop")}
            disabled={!isEnabled || ambientListeningStatus === "Stop"}
          >
            <Square size={14} className="fill-current" />
            {ambientListeningStatus === "Stop" ? "Monitoring Stopped" : "Stop Ambient Listening"}
          </Button>

          <div className="space-y-3 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-[11px] text-muted-foreground leading-relaxed">
             <div className="flex items-start gap-3">
               <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
               <p>
                 <span className="font-bold text-primary">Control Logic:</span> Ambient listening updates may take a few seconds to propagate.
               </p>
             </div>
             
             <div className="grid gap-2 mt-2 border-t border-primary/10 pt-3">
               <div className="flex gap-2">
                 <Badge variant="outline" className="h-4 text-[8px] font-black bg-primary/10 border-primary/30 text-primary">ENABLE</Badge>
                 <p className="text-[10px]">Continuous record and sending 5 minutes of voice data continuously.</p>
               </div>
               <div className="flex gap-2">
                 <Badge variant="outline" className="h-4 text-[8px] font-black bg-muted border-border text-muted-foreground">DISABLE</Badge>
                 <p className="text-[10px]">Sending audio file will be stopped but continue recording and storing 5 minutes voice data.</p>
               </div>
               <div className="flex gap-2">
                 <Badge variant="outline" className="h-4 text-[8px] font-black bg-destructive/10 border-destructive/30 text-destructive">STOP</Badge>
                 <p className="text-[10px]">Stops recording, storing, and sending of voice data.</p>
               </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

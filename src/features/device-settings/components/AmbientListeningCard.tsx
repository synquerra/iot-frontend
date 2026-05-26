import { useState, useEffect } from "react";
import { Card, Box, Text, Switch, Badge, Button, Group } from "@mantine/core";
import { Square, Mic, Info } from "lucide-react";
import { toggleAmbientListening } from "../services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

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
    <Card shadow="sm" radius="md" withBorder padding={0} className={cn(
      "h-full flex flex-col transition-all",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <Box className="py-3 px-4 border-b border-border bg-muted/5">
        <Text size="sm" fw={700} tt="uppercase" className="tracking-tight">
          Ambient Listening
        </Text>
        <Text size="0.6rem" fw={700} tt="uppercase" className="tracking-widest" c="dimmed">
          {!isEnabled 
            ? "Select device to view status" 
            : "Audio monitoring and control"}
        </Text>
      </Box>

      <Box className="space-y-6 flex-1 p-6">
        <Group justify="space-between" align="center" className="rounded-xl bg-muted/40 border border-border p-4">
          <Group gap="md" align="center">
            <Box className={cn(
              "rounded-full p-2.5 transition-colors",
              isListening ? "bg-primary/20 text-primary animate-pulse" : "bg-muted text-muted-foreground"
            )}>
              <Mic className="h-5 w-5" />
            </Box>
            <Box>
              <Text size="sm" fw={700} className="tracking-tight">Audio Monitor Status</Text>
              <Text size="xs" c="dimmed">
                {isListening ? "Device is actively streaming audio" : "Monitoring is currently inactive"}
              </Text>
            </Box>
          </Group>

          <Group gap="sm" align="center">
             <Badge variant={isListening ? "filled" : "outline"} color={isListening ? "blue" : "gray"} className={cn(
               "font-black tracking-widest px-2",
             )}>
               {ambientListeningStatus || "READY"}
             </Badge>
             <Switch
               checked={isListening}
               onChange={(event) => handleToggleAmbient(event.currentTarget.checked ? "Enable" : "Disable")}
               disabled={!isEnabled}
             />
          </Group>
        </Group>

        <Box className="grid grid-cols-1 gap-4">
          <Button
            color="red"
            variant="filled"
            leftSection={<Square size={14} className="fill-current" />}
            className="h-auto py-4 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10"
            onClick={() => handleToggleAmbient("Stop")}
            disabled={!isEnabled || ambientListeningStatus === "Stop"}
          >
            {ambientListeningStatus === "Stop" ? "Monitoring Stopped" : "Stop Ambient Listening"}
          </Button>

          <Box className="space-y-3 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-[11px] text-muted-foreground leading-relaxed">
             <Group align="flex-start" gap="sm" wrap="nowrap">
               <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
               <Text size="xs">
                 <Text component="span" fw={700} className="text-primary">Control Logic:</Text> Ambient listening updates may take a few seconds to propagate.
               </Text>
             </Group>
             
             <Box className="grid gap-2 mt-2 border-t border-primary/10 pt-3">
               <Group gap="sm" wrap="nowrap">
                 <Badge variant="outline" color="blue" size="xs" className="font-black bg-primary/10">ENABLE</Badge>
                 <Text size="0.65rem">Continuous record and sending 5 minutes of voice data continuously.</Text>
               </Group>
               <Group gap="sm" wrap="nowrap">
                 <Badge variant="outline" color="gray" size="xs" className="font-black bg-muted">DISABLE</Badge>
                 <Text size="0.65rem">Sending audio file will be stopped but continue recording and storing 5 minutes voice data.</Text>
               </Group>
               <Group gap="sm" wrap="nowrap">
                 <Badge variant="outline" color="red" size="xs" className="font-black bg-red-500/10">STOP</Badge>
                 <Text size="0.65rem">Stops recording, storing, and sending of voice data.</Text>
               </Group>
             </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

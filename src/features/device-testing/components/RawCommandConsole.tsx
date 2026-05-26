import { Card, Button, Group, Text, Box } from "@mantine/core";
import { Terminal, Send, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import api from "@/lib/axios";

interface RawCommandConsoleProps {
  topic?: string | null;
}

export function RawCommandConsole({ topic }: RawCommandConsoleProps) {
  const [command, setCommand] = useState('{\n  "command": "SET_CONFIG",\n  "params": {\n    "example": 123\n  }\n}');
  const { setIsLoading } = useGlobalLoading();

  const handleSend = async () => {
    if (!topic) {
      toast.error("Device topic is missing. Please select a device.");
      return;
    }

    try {
      // Validate JSON
      const parsed = JSON.parse(command);
      
      setIsLoading(true, "Sending raw command...");
      
      const response = await api.post("/setting/raw", {
        topic,
        ...parsed
      });

      if (response.data.status === "success") {
        toast.success(response.data.message || "Raw command sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send command");
      }
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        toast.error("Invalid JSON format. Please check your command structure.");
      } else {
        toast.error("Error sending command. The /setting/raw endpoint might not be ready yet.");
        console.warn("Possible missing endpoint: /setting/raw", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm flex flex-col h-full p-0">
      <Group justify="space-between" align="center" className="pb-4 p-4 border-b border-primary/5 text-left">
        <div className="flex-1">
          <Text size="sm" fw={700} className="flex items-center gap-2 text-foreground">
            <Terminal className="h-5 w-5 text-primary" />
            Raw Command Console
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <Text size="xs" className="text-muted-foreground">Directly publish MQTT payloads</Text>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/10 uppercase tracking-tighter">
              <AlertCircle size={10} />
              Target: {topic || "None"}
            </span>
          </div>
        </div>
        <Button 
          onClick={handleSend}
          size="sm"
          color="blue"
          className="text-white gap-2 font-bold px-4 shadow-lg"
        >
          <Send className="h-3.5 w-3.5 mr-1" />
          Dispatch
        </Button>
      </Group>
      <Box className="space-y-4 flex-1 flex flex-col pt-6 p-4">
        <div className="relative flex-1 min-h-[300px]">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full h-full font-mono text-sm bg-slate-950 text-emerald-400 border border-primary/20 focus:ring-1 focus:ring-primary/30 outline-none resize-none p-6 rounded-md shadow-inner"
            placeholder='{ "action": "REBOOT" }'
          />
          <div className="absolute top-4 right-4 opacity-30">
             <Info className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </Box>
    </Card>
  );
}

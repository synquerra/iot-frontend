import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Send, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
      
      // We'll use a generic endpoint or a fallback for testing
      // The user wants to test "raw/new commands"
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
    <Card className="border-primary/10 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4 border-b border-primary/5 flex flex-row items-center justify-between space-y-0 text-left">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Raw Command Console
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Directly publish MQTT payloads
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/10 uppercase tracking-tighter">
              <AlertCircle size={10} />
              Target: {topic || "None"}
            </span>
          </CardDescription>
        </div>
        <Button 
          onClick={handleSend}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold px-4 shadow-lg shadow-primary/20"
        >
          <Send className="h-3.5 w-3.5" />
          Dispatch
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col pt-6">
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
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Send, Trash2, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";

interface TestingResultsConsoleProps {
  topic?: string | null;
}

export function TestingResultsConsole({ topic }: TestingResultsConsoleProps) {
  const { setIsLoading } = useGlobalLoading();
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: "info" | "success" | "error" }>>([
    { id: "1", time: "16:14:40", msg: "Device connected to MQTT broker", type: "info" },
    { id: "2", time: "16:14:41", msg: "Heartbeat received: { imei: '8468...', v: 4.2 }", type: "info" },
    { id: "3", time: "16:14:45", msg: "Packet Ack: 200 OK", type: "success" },
  ]);
  const [command, setCommand] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = () => setLogs([]);

  const handleCommandChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value);
  };

  const handleSend = async () => {
    if (!topic) {
      toast.error("Device topic missing");
      return;
    }
    if (!command.trim()) return;

    try {
      setIsLoading(true, "Dispatching command...");
      await new Promise(r => setTimeout(r, 800));
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString([], { hour12: false }),
        msg: `Sent: ${command}`,
        type: "success"
      }]);
      setCommand("");
      toast.success("Command dispatched");
    } catch {
      toast.error("Dispatch failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-xl bg-card overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b border-primary/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold tracking-tight">Results Console</CardTitle>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Stream</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground mr-2">
               {new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN", { hour12: false })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleClear}>
               <Trash2 size={14} />
            </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col md:flex-row h-[320px]">
        {/* Logs Section */}
        <div className="flex-[2] border-r border-primary/5 flex flex-col bg-muted/10">
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] leading-relaxed">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 group">
                   <span className="text-muted-foreground/50 whitespace-nowrap tabular-nums">{log.time}</span>
                   <span className={
                     log.type === "success" ? "text-emerald-500 font-medium" : 
                     log.type === "error" ? "text-red-500 font-medium" : 
                     "text-foreground/90"
                   }>
                     {log.msg}
                   </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground italic text-[10px]">
                  Waiting for device telemetry...
                </div>
              )}
           </div>
        </div>

        {/* Command Input Section */}
        <div className="flex-1 p-4 bg-muted/20 flex flex-col gap-3">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Manual Command</span>
              <CheckCircle className="h-3 w-3 text-emerald-500 opacity-50" />
           </div>
           <textarea 
             placeholder='{"cmd": "RESET", "val": 1}...'
             className="flex-1 w-full p-3 font-mono text-[11px] bg-background border border-primary/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none opacity-60 cursor-not-allowed"
             value={command}
             onChange={handleCommandChange}
             disabled
           />
           <Button onClick={handleSend} className="w-full h-10 gap-2 font-bold shadow-lg shadow-primary/10 uppercase tracking-wider text-xs" disabled>
              <Send size={14} />
              Dispatch Packet
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

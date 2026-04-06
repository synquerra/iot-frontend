import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  payload?: any;
}

export function DeviceLogConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <Card className="border-primary/10 shadow-sm flex flex-col h-[500px]">
      <CardHeader className="pb-4 border-b border-primary/5 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Terminal className="h-5 w-5 text-primary" />
            Device Live Logs
          </CardTitle>
          <CardDescription className="text-xs">Real-time simulation of incoming device telemetry</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={clearLogs} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div className="h-full w-full bg-slate-950 p-4 font-mono text-xs overflow-auto custom-scrollbar">
          <div ref={scrollRef} className="space-y-1">
            {logs.length === 0 && (
              <div className="text-slate-500 italic animate-pulse">Waiting for incoming logs...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 border-b border-slate-900 pb-1">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`px-1 rounded shrink-0 font-bold uppercase text-[9px] ${
                  log.level === 'warn' ? 'text-orange-500 bg-orange-500/10' : 
                  log.level === 'error' ? 'text-red-500 bg-red-500/10' : 
                  'text-emerald-500 bg-emerald-500/10'
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 right-4 animate-ping h-2 w-2 rounded-full bg-emerald-500 opacity-75" />
      </CardContent>
    </Card>
  );
}

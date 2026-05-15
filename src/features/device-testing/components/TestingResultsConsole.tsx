import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Terminal, Send, Trash2, History, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { getRawMessages, sendTestCommand, type RawMqttMessage } from "../services/testingService";
import { cn } from "@/lib/utils";

interface TestingResultsConsoleProps {
  imei?: string | null;
}

export function TestingResultsConsole({ imei }: TestingResultsConsoleProps) {
  const { setIsLoading } = useGlobalLoading();
  const [messages, setMessages] = useState<RawMqttMessage[]>([]);
  const [command, setCommand] = useState("");
  const [sessionCommands, setSessionCommands] = useState<Array<{ text: string; time: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (!imei) return;

    const fetchLatest = async (isInitial = false) => {
      try {
        const response = await getRawMessages(imei, 0, isInitial ? 5 : 15);
        setMessages(response.messages);
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    fetchLatest(true);
    pollingRef.current = setInterval(() => fetchLatest(false), 1500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [imei]);

  const handleClear = () => setMessages([]);

  const handleSendManual = async () => {
    if (!imei) {
      toast.error("Device identification missing");
      return;
    }
    if (!command.trim()) return;

    try {
      setIsLoading(true, "Publishing test packet...");
      let payload;
      try {
        payload = JSON.parse(command);
      } catch {
        payload = command;
      }

      await sendTestCommand({ imei, payload });

      const now = new Date().toLocaleTimeString([], { hour12: false });
      setSessionCommands(prev => [{ text: command, time: now }, ...prev]);
      setCommand("");
      toast.success("Command published successfully");

      setTimeout(async () => {
        const response = await getRawMessages(imei, 0, 50);
        setMessages(response.messages.reverse());
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || "Failed to publish command");
    } finally {
      setIsLoading(false);
    }
  };

  const useHistoryCommand = (cmd: string) => setCommand(cmd);

  return (
    <div className="flex flex-col h-[600px] border border-border/60 rounded-2xl bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* High-Density Header */}
      <div className="flex items-center justify-between py-3 px-4 border-b flex-row gap-3 space-y-0 bg-muted/5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wide">Packet Stream Console</h3>
          <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-500/5 animate-pulse ml-2">
            Live
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-muted/30 border-border/50">
             {messages.length} Packets Captured
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClear}
                className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px] font-bold uppercase tracking-widest">Clear Buffer</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
        {/* Messages Panel */}
        <div className="lg:col-span-8 border-r border-border/50 flex flex-col min-h-0 bg-background">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group border border-border/40 rounded-xl bg-card shadow-sm px-4 py-3 hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                       <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">
                         {new Date(msg.received_at).toLocaleTimeString([], { hour12: false, second: '2-digit' })}
                       </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                              msg.message_type === "json" 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {msg.message_type}
                          </Badge>
                          <span className="text-[11px] font-mono font-semibold text-foreground/70 truncate tracking-tight">
                            {msg.topic}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground/50 group-hover:text-primary/60 transition-colors uppercase font-bold">
                          ID: {msg.id.slice(-6)}
                        </span>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 shadow-inner overflow-x-auto">
                        <pre className="text-[12px] font-mono whitespace-pre-wrap break-all text-emerald-400 leading-relaxed">
                          {msg.payload_text}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-border">
                    <Terminal className="h-8 w-8 opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold tracking-tight">Listening for Packets</p>
                    <p className="text-xs text-muted-foreground">Waiting for MQTT handshake...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Command Panel */}
        <div className="lg:col-span-4 flex flex-col min-h-0 bg-muted/10">
          {/* Command Input */}
          <div className="p-5 border-b border-border/50 space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Packet Injector</label>
              <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase">JSON Schema</Badge>
            </div>
            <div className="relative">
              <Textarea
                placeholder='{"action": "ping", "timestamp": "now"}'
                className="font-mono text-xs min-h-[120px] resize-none bg-background border-border shadow-sm rounded-xl focus:ring-1 focus:ring-primary/20 transition-all p-4"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
              <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500/40 animate-pulse" />
            </div>
            <Button
              onClick={handleSendManual}
              size="lg"
              className={cn(
                "w-full gap-3 font-black uppercase tracking-[0.2em] text-[10px] h-12 rounded-xl transition-all shadow-lg",
                command.trim() ? "bg-primary hover:shadow-primary/30" : "bg-muted text-muted-foreground"
              )}
              disabled={!command.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Inject Packet
            </Button>
          </div>

          {/* Command History */}
          <div className="flex-1 flex flex-col min-h-0 p-5">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session History</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold h-5 px-2 rounded-md">
                {sessionCommands.length}
              </Badge>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {sessionCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => useHistoryCommand(cmd.text)}
                    className="w-full text-left p-3 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        {cmd.time}
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <code className="text-xs font-mono text-foreground truncate block group-hover:text-primary transition-colors">
                      {cmd.text}
                    </code>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}

                {sessionCommands.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground space-y-2">
                    <p className="text-sm font-bold tracking-tight">No Buffer</p>
                    <p className="text-xs text-muted-foreground">Waiting for injection...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Terminal, Send, Trash2, History, ChevronRight, Activity, Wifi, Radio, Maximize2, Minimize2 } from "lucide-react";
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
  const [isFullScreen, setIsFullScreen] = useState(false);
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
    <TooltipProvider>
      <div 
        className={cn(
          "flex flex-col border border-border/60 bg-card shadow-xl overflow-hidden transition-all duration-300",
          isFullScreen 
            ? "fixed inset-0 z-[100] h-screen w-screen rounded-none bg-background/95 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200" 
            : "h-[650px] rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
        )}
      >
        {/* High-Density Header Styled like MQTTBox Client Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-100">MQTT CLIENT CONSOLE</h3>
            <Badge variant="outline" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-400 bg-emerald-500/10 animate-pulse">
              <Wifi className="h-2.5 w-2.5 mr-1" /> Connected
            </Badge>
          </div>

          {/* Connection Details Bar */}
          <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-slate-400">
            <div className="bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
              <span className="text-slate-500 font-bold">HOST:</span> <span className="text-emerald-400">mqtt://broker.synquerra.com:1883</span>
            </div>
            <div className="bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50 hidden md:block">
              <span className="text-slate-500 font-bold">CLIENT_ID:</span> <span className="text-slate-300">synquerra-{imei ? imei.slice(-6) : "tester"}</span>
            </div>
          </div>
        </div>

        {/* Subscriptions Bar */}
        <div className="bg-slate-800 dark:bg-slate-900 border-b border-slate-700/50 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">SUBSCRIBED TOPIC:</span>
            <code className="bg-slate-900/60 text-blue-400 font-mono px-2 py-0.5 rounded text-[11px] truncate border border-slate-700/30">
              {imei ? `${imei}/pub` : "+/pub"}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="h-7 w-7 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                >
                  {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px] font-bold uppercase tracking-widest">
                {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClear}
                  className="h-7 w-7 rounded-lg hover:bg-destructive/20 hover:text-destructive-foreground text-slate-400 hover:text-white transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px] font-bold uppercase tracking-widest">Clear Buffer</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
          {/* Command Panel (MQTT Publish Pane) - Now on the Left */}
          <div className="lg:col-span-4 border-r border-border/50 flex flex-col min-h-0 bg-muted/10">
            {/* Command Input */}
            <div className="p-4 border-b border-border/50 space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">PUBLISH PACKET</label>
                <Badge variant="outline" className="text-[8px] font-mono font-black tracking-widest uppercase border-primary/20 text-primary">JSON MODE</Badge>
              </div>
              <div className="relative">
                <Textarea
                  placeholder='{"Query":"NormalPacket"}'
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
                  "w-full gap-3 font-black uppercase tracking-[0.2em] text-[10px] h-11 rounded-xl transition-all shadow-lg",
                  command.trim() ? "bg-primary hover:shadow-primary/30" : "bg-muted text-muted-foreground"
                )}
                disabled={!command.trim()}
              >
                <Send className="h-3.5 w-3.5" />
                Publish to Broker
              </Button>
            </div>

            {/* Command History */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Publish History</span>
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
                    <div className="text-center py-12 text-muted-foreground/60 space-y-2">
                      <p className="text-xs font-bold tracking-wider uppercase">No Buffers Published</p>
                      <p className="text-[10px] text-muted-foreground">Drafted commands appear here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Messages Panel (MQTT Subscribe Stream) - Now on the Right */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-background">
            <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-500" /> Incoming Payload Stream
              </span>
            </div>
            
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-2.5 space-y-2.5">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "group pb-2.5 transition-all duration-200",
                      idx !== messages.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-950 rounded-lg py-2 px-3 border border-slate-800 shadow-inner overflow-x-auto">
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
                      <p className="text-sm font-bold tracking-tight text-foreground/70">Listening for Packets</p>
                      <p className="text-xs text-muted-foreground">Waiting for active device MQTT publications...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current && isLive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLive]);

  useEffect(() => {
    if (!imei) return;

    const fetchLatest = async (isInitial = false) => {
      try {
        const response = await getRawMessages(imei, 0, isInitial ? 5 : 10);
        setMessages(response.messages.reverse());
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    fetchLatest(true);
    pollingRef.current = setInterval(() => fetchLatest(false), 1000);

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
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Packet Stream</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear console</TooltipContent>
        </Tooltip>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-3 flex-1 min-h-0">
        {/* Messages Panel */}
        <div className="col-span-2 border-r flex flex-col min-h-0">
          <div className="px-4 py-2 border-b bg-muted/20">
            <span className="text-xs font-mono text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-0 p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group border-b last:border-0 px-2 py-2 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {new Date(msg.received_at).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-mono px-1.5",
                            msg.message_type === "json" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          )}
                        >
                          {msg.message_type}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground truncate">
                          {msg.topic}
                        </span>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground/80">
                        {msg.payload_text}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Terminal className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">No messages received</p>
                  <p className="text-[10px]">Waiting for device connection...</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {!isLive && messages.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsLive(true);
                  if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }}
              >
                Scroll to bottom
              </Button>
            </div>
          )}
        </div>

        {/* Command Panel */}
        <div className="flex flex-col min-h-0">
          {/* Command Input */}
          <div className="p-3 border-b space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Send Command</label>
              <span className="text-[10px] font-mono text-muted-foreground">JSON or string</span>
            </div>
            <Textarea
              placeholder='{"command": "get_status"}'
              className="font-mono text-xs min-h-[80px] resize-none"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
            <Button
              onClick={handleSendManual}
              size="sm"
              className="w-full gap-2"
              disabled={!command.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Execute
            </Button>
          </div>

          <Separator />

          {/* Command History */}
          <div className="flex-1 flex flex-col min-h-0 p-3">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">History</span>
              <span className="text-[10px] text-muted-foreground">
                ({sessionCommands.length})
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {sessionCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => useHistoryCommand(cmd.text)}
                    className="w-full text-left p-2 rounded border bg-muted/10 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {cmd.time}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <code className="text-[11px] font-mono truncate block">
                      {cmd.text}
                    </code>
                  </button>
                ))}

                {sessionCommands.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-xs">No commands sent</p>
                    <p className="text-[10px] mt-1">Commands will appear here</p>
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
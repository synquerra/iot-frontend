import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Headphones, Square } from "lucide-react";

type AmbientListeningCardProps = {
  selectedImei?: string;
};

export function AmbientListeningCard({ selectedImei }: AmbientListeningCardProps) {
  const isEnabled = Boolean(selectedImei);

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col opacity-50 grayscale pointer-events-none select-none">
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

      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Ambient Listening</p>
              <p className="text-sm text-muted-foreground">
                Toggle real-time audio monitoring on the device
              </p>
            </div>
          </div>

          <Switch
            checked={false}
            disabled={true}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Button
            variant="destructive"
            className="gap-2 h-auto py-3"
            disabled={true}
          >
            <Square size={16} />
            Stop Ambient Listening
          </Button>

          <div className="flex items-center rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Ambient listening features are currently restricted.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

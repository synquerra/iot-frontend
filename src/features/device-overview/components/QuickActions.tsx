import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: Phone, label: "Call Guardian", color: "blue" },
    { icon: MessageSquare, label: "Send SMS", color: "green" },
    { icon: MapPin, label: "Locate Device", color: "purple" },
    { icon: AlertTriangle, label: "SOS Test", color: "red", destructive: true },
  ];

  const colorStyles: Record<string, string> = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };

  return (
    <Card className="relative opacity-60 grayscale-[0.5] pointer-events-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">Dummy</span>
        </div>
        <CardDescription>Remote device controls</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-auto py-3 px-4",
              action.destructive &&
                "text-destructive hover:text-destructive hover:bg-destructive/10",
            )}
          >
            <action.icon
              className={cn(
                "h-4 w-4",
                !action.destructive && colorStyles[action.color],
              )}
            />
            <span className="flex-1 text-left">{action.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface AlertBannerProps {
  alert: string;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (alert === "Normal") return null;

  return (
    <div className="rounded-xl border border-destructive/20 bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 animate-in slide-in-from-top">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-destructive/20 p-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-destructive">Device Alert</p>
          <p className="text-sm text-destructive/80">
            Device is in {alert} mode. Immediate attention required.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

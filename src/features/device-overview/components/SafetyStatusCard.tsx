import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SafetyStatusCardProps {
  alert: string;
}

export function SafetyStatusCard({
  alert,
}: SafetyStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Safety Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Alert Level</span>
            <Badge variant={alert === "SOS" ? "destructive" : "secondary"}>
              {alert}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

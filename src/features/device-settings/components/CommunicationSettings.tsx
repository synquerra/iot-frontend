import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import {
  ambientListeningActions,
  communicationIcons,
  contacts,
} from "../constants";

const { bell: Bell, headphones: Headphones, phone: Phone } = communicationIcons;

export function CommunicationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Registered Mobile Numbers
            </CardTitle>
            <CardDescription>
              Manage emergency and registered contacts
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Pencil size={14} />
            Edit Numbers
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {contacts.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-muted p-3 transition-colors hover:bg-muted/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${item.indicatorClassName}`}
                  />

                  <div>
                    <span className="font-medium">{item.label}</span>
                    <p className="text-sm text-muted-foreground">
                      {item.number}
                    </p>
                  </div>
                </div>

                <Badge variant={item.badgeVariant}>{item.badge}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            Ambient Listening
          </CardTitle>
          <CardDescription>Configure audio monitoring settings</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ambient Listening</p>
                <p className="text-sm text-muted-foreground">
                  Enable real-time audio monitoring
                </p>
              </div>
            </div>

            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ambientListeningActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="gap-2"
              >
                <action.icon size={16} />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

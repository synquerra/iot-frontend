import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  COMMANDS,
  type PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";
import {
  getDeviceCommandToastContent,
  sendDeviceCommand,
} from "@/helpers/deviceCommandHelper";
import {
  Gauge,
  Loader2,
  Mic,
  Phone,
  Plane,
  Satellite,
  SunMedium,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ModesSettingsProps = {
  selectedImei: string;
};

type ModeActionButton = {
  label: string;
  command: string;
  variant?: "default" | "outline";
};

type ModeActionGroup = {
  title: string;
  description: string;
  icon: typeof Phone;
  actions: ModeActionButton[];
};

const modeActions: ModeActionGroup[] = [
  {
    title: "Call Controls",
    description: "Allow or block calling features on the device",
    icon: Phone,
    actions: [
      { label: "Enable Calls", command: COMMANDS.CALL_ENABLE },
      {
        label: "Disable Calls",
        command: COMMANDS.CALL_DISABLE,
        variant: "outline" as const,
      },
    ],
  },
  {
    title: "LED Controls",
    description: "Turn the device LED indicator on or off",
    icon: SunMedium,
    actions: [
      { label: "LED On", command: COMMANDS.LED_ON },
      { label: "LED Off", command: COMMANDS.LED_OFF, variant: "outline" as const },
    ],
  },
  {
    title: "Ambient Listening",
    description: "Quick ambient mode controls from the modes tab",
    icon: Mic,
    actions: [
      { label: "Enable Ambient", command: COMMANDS.AMBIENT_ENABLE },
      {
        label: "Disable Ambient",
        command: COMMANDS.AMBIENT_DISABLE,
        variant: "outline" as const,
      },
    ],
  },
  {
    title: "Airplane Mode",
    description: "Enable airplane mode on the device",
    icon: Plane,
    actions: [{ label: "Enable Airplane", command: COMMANDS.AIRPLANE_ENABLE }],
  },
  {
    title: "GPS Controls",
    description: "Disable GPS tracking on the device",
    icon: Satellite,
    actions: [
      { label: "Disable GPS", command: COMMANDS.GPS_DISABLE, variant: "outline" as const },
    ],
  },
];

export function ModesSettings({ selectedImei }: ModesSettingsProps) {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const handleCommand = async (command: string) => {
    if (!selectedImei) {
      toast.error("Select a device before sending a command.");
      return;
    }

    try {
      setActiveCommand(command);
      const response = await sendDeviceCommand<PublishedDeviceCommandResult>(
        selectedImei,
        command,
        {},
      );

      const toastContent = getDeviceCommandToastContent(response);
      toast.success(toastContent.title, {
        description: toastContent.description,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Failed to send ${command}.`;
      toast.error(message);
    } finally {
      setActiveCommand(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          Device Modes
        </CardTitle>
        <CardDescription>Send quick enable and disable commands</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modeActions.map((item) => (
            <div
              key={item.title}
              className="space-y-4 rounded-lg border p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.actions.map((action) => {
                  const isLoading = activeCommand === action.command;

                  return (
                    <Button
                      key={action.command}
                      variant={action.variant ?? "default"}
                      size="sm"
                      className="gap-2"
                      onClick={() => handleCommand(action.command)}
                      disabled={activeCommand !== null}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

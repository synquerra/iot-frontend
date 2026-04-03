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
  Loader2,
  Phone,
  Plane,
  Settings,
  SunMedium,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GeneralDeviceControlsProps = {
  selectedImei: string;
};

type ActionButtonType = {
  label: string;
  command: string;
  variant?: "default" | "outline";
};

type ActionGroupType = {
  title: string;
  description: string;
  icon: typeof Phone;
  disabledControl?: boolean;
  actions: ActionButtonType[];
};

const controlActions: ActionGroupType[] = [
  {
    title: "Call Controls",
    description: "Allow or block calling features on the device",
    icon: Phone,
    disabledControl: true, // Specifically requested to be disabled for now
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
    title: "Airplane Mode",
    description: "Enable airplane mode on the device",
    icon: Plane,
    actions: [{ label: "Enable Airplane", command: COMMANDS.AIRPLANE_ENABLE }],
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
];

export function GeneralDeviceControls({ selectedImei }: GeneralDeviceControlsProps) {
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
    <Card className="border-primary/10 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          General Controls
        </CardTitle>
        <CardDescription>Always visible primary device toggle commands</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controlActions.map((item) => (
            <div
              key={item.title}
              className={`space-y-4 rounded-lg border p-4 transition-colors ${item.disabledControl ? "opacity-50 grayscale" : "hover:border-primary/30"}`}
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
                      disabled={activeCommand !== null || item.disabledControl}
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

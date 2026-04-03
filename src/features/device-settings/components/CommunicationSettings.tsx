import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";
import {
  COMMANDS,
  type PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";
import {
  getDeviceCommandToastContent,
  sendDeviceCommand,
} from "@/helpers/deviceCommandHelper";
import { Bell, Headphones, Loader2, Phone, Save, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CommunicationSettingsProps = {
  selectedImei: string;
  latestSettings: LatestDeviceSettingsRecord | null;
  isLoadingLatestSettings: boolean;
};

type ContactsFormState = {
  phonenum1: string;
  phonenum2: string;
  controlroomnum: string;
};

const DEFAULT_CONTACTS: ContactsFormState = {
  phonenum1: "",
  phonenum2: "",
  controlroomnum: "",
};

const contactFields: Array<{
  key: keyof ContactsFormState;
  label: string;
  placeholder: string;
  badge: string;
  badgeVariant: "secondary" | "destructive";
  indicatorClassName: string;
  editable: boolean;
}> = [
  {
    key: "phonenum1",
    label: "Primary Number",
    placeholder: "Enter primary phone number",
    badge: "Primary",
    badgeVariant: "secondary",
    indicatorClassName: "bg-green-500",
    editable: true,
  },
  {
    key: "phonenum2",
    label: "Secondary Number",
    placeholder: "Enter secondary phone number",
    badge: "Secondary",
    badgeVariant: "secondary",
    indicatorClassName: "bg-blue-500",
    editable: true,
  },
  {
    key: "controlroomnum",
    label: "Control Room Number",
    placeholder: "Control room phone number",
    badge: "Emergency",
    badgeVariant: "destructive",
    indicatorClassName: "bg-red-500",
    editable: false,
  },
];

export function CommunicationSettings({
  selectedImei,
  latestSettings,
  isLoadingLatestSettings,
}: CommunicationSettingsProps) {
  const [contacts, setContacts] = useState<ContactsFormState>(DEFAULT_CONTACTS);
  const [isSavingContacts, setIsSavingContacts] = useState(false);
  const [isAmbientEnabled, setIsAmbientEnabled] = useState(false);
  const [isAmbientSubmitting, setIsAmbientSubmitting] = useState(false);

  useEffect(() => {
    setContacts({
      phonenum1: latestSettings?.raw_phonenum1 ?? "",
      phonenum2: latestSettings?.raw_phonenum2 ?? "",
      controlroomnum: latestSettings?.raw_controlroomnum ?? "",
    });
  }, [
    latestSettings?.raw_controlroomnum,
    latestSettings?.raw_phonenum1,
    latestSettings?.raw_phonenum2,
  ]);

  const runCommand = async (command: string, params: Record<string, unknown> = {}) => {
    if (!selectedImei) {
      toast.error("Select a device before sending a command.");
      return null;
    }

    const response = await sendDeviceCommand<PublishedDeviceCommandResult>(
      selectedImei,
      command,
      params,
    );

    const toastContent = getDeviceCommandToastContent(response);
    toast.success(toastContent.title, {
      description: toastContent.description,
    });

    return response;
  };

  const handleContactChange = (key: keyof ContactsFormState, value: string) => {
    setContacts((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSaveContacts = async () => {
    try {
      setIsSavingContacts(true);
      await runCommand(COMMANDS.SET_CONTACTS, contacts);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update contacts.";
      toast.error(message);
    } finally {
      setIsSavingContacts(false);
    }
  };

  const handleAmbientToggle = async (checked: boolean) => {
    try {
      setIsAmbientSubmitting(true);
      await runCommand(
        checked ? COMMANDS.AMBIENT_ENABLE : COMMANDS.AMBIENT_DISABLE,
      );
      setIsAmbientEnabled(checked);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update ambient listening.";
      toast.error(message);
    } finally {
      setIsAmbientSubmitting(false);
    }
  };

  const handleAmbientStop = async () => {
    try {
      setIsAmbientSubmitting(true);
      await runCommand(COMMANDS.AMBIENT_STOP);
      setIsAmbientEnabled(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to stop ambient listening.";
      toast.error(message);
    } finally {
      setIsAmbientSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Registered Mobile Numbers
            </CardTitle>
            <CardDescription>
              Manage emergency and registered contacts through the `SET_CONTACTS`
              command
            </CardDescription>
            {latestSettings?.device_timestamp ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Last config snapshot:{" "}
                {new Date(latestSettings.device_timestamp).toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
        </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
            {contactFields.map((item) => (
              <div
                key={item.label}
                className="space-y-3 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${item.indicatorClassName}`}
                    />

                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingLatestSettings
                          ? "Loading latest value from device settings..."
                          : item.editable
                            ? "Enter the number exactly as expected by the device API"
                            : "Shown from latest device settings and locked from editing"}
                      </p>
                    </div>
                  </div>

                  <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={item.key}>{item.label}</Label>
                  <Input
                    id={item.key}
                    inputMode="numeric"
                    maxLength={15}
                    placeholder={item.placeholder}
                    value={contacts[item.key]}
                    disabled={!item.editable}
                    onChange={(event) =>
                      handleContactChange(item.key, event.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 mt-auto border-t border-border">
            <Button
              className="gap-2"
              onClick={handleSaveContacts}
              disabled={isSavingContacts}
            >
              {isSavingContacts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSavingContacts ? "Saving..." : "Save Contacts"}
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}

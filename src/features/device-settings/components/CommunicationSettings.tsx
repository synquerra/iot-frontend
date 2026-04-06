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
import {
  updateDevicePhoneNumbers,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Phone, Save } from "lucide-react";
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
    editable: true,
  },
];

export function CommunicationSettings({
  selectedImei,
  latestSettings,
  isLoadingLatestSettings,
}: CommunicationSettingsProps) {
  const [contacts, setContacts] = useState<ContactsFormState>(DEFAULT_CONTACTS);
  const { setIsLoading } = useGlobalLoading();

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

  const handleContactChange = (key: keyof ContactsFormState, value: string) => {
    setContacts((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSaveContacts = async () => {
    if (!latestSettings?.topic) {
      toast.error("Device topic is missing.");
      return;
    }

    try {
      setIsLoading(true, "Updating device contacts...");
      const response = await updateDevicePhoneNumbers({
        topic: latestSettings.topic,
        phonenum1: contacts.phonenum1,
        phonenum2: contacts.phonenum2,
        controlroomnum: contacts.controlroomnum,
      });

      if (response.status === "success") {
        toast.success(response.message || "Device contacts updated successfully");
      } else {
        toast.error(response.message || "Failed to update contacts");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred while updating contacts.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-4 border-b border-primary/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Registered Mobile Numbers
            </CardTitle>
            <CardDescription>
              Direct contact management through dedicated synchronization API
            </CardDescription>
            {latestSettings?.device_timestamp ? (
              <p className="mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                Snapshot: {new Date(latestSettings.device_timestamp).toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
          <Button
            className="gap-2 font-bold shadow-lg shadow-primary/10"
            onClick={handleSaveContacts}
            size="sm"
          >
            <Save size={14} />
            Save Contacts
          </Button>
        </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 flex-1">
            {contactFields.map((item) => (
              <div
                key={item.key}
                className="space-y-3 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${item.indicatorClassName}`}
                    />

                    <div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </div>

                  <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                </div>

                <div className="space-y-2">
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

        </CardContent>
    </Card>
  );
}


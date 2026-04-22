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
import { cn } from "@/lib/utils";

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
  indicatorColor: string;
  editable: boolean;
}> = [
  {
    key: "phonenum1",
    label: "Primary Number",
    placeholder: "Enter primary number",
    badge: "Primary",
    badgeVariant: "secondary",
    indicatorColor: "bg-emerald-500",
    editable: true,
  },
  {
    key: "phonenum2",
    label: "Secondary Number",
    placeholder: "Enter secondary number",
    badge: "Secondary",
    badgeVariant: "secondary",
    indicatorColor: "bg-primary/60",
    editable: true,
  },
  {
    key: "controlroomnum",
    label: "Emergency Line",
    placeholder: "Control room number",
    badge: "SOS",
    badgeVariant: "destructive",
    indicatorColor: "bg-destructive",
    editable: true,
  },
];

export function CommunicationSettings({
  selectedImei,
  latestSettings,
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
      setIsLoading(true, "Updating contacts...");
      const response = await updateDevicePhoneNumbers({
        topic: latestSettings.topic,
        phonenum1: contacts.phonenum1,
        phonenum2: contacts.phonenum2,
        controlroomnum: contacts.controlroomnum,
      });

      if (response.status === "success") {
        toast.success(response.message || "Contacts updated successfully");
      } else {
        toast.error(response.message || "Failed to update contacts");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isEnabled = Boolean(selectedImei);

  return (
    <Card className={cn(
      "border-border shadow-sm transition-all duration-300 bg-card rounded-xl",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/5">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Phone className="h-5 w-5 text-primary" />
              Communication Hub
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {!isEnabled 
                ? "Select a device to sync contacts" 
                : "Manage emergency and primary device contacts"}
            </CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto gap-2 font-bold h-9 px-4"
            onClick={handleSaveContacts}
            disabled={!isEnabled}
            size="sm"
          >
            <Save size={14} />
            Sync Contacts
          </Button>
        </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contactFields.map((item) => (
              <div
                key={item.key}
                className="space-y-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/20 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full group-hover:scale-125 transition-transform", item.indicatorColor)} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  <Badge variant={item.badgeVariant} className="text-[10px] uppercase font-bold px-2 py-0 h-5">
                    {item.badge}
                  </Badge>
                </div>

                <div className="relative">
                  <Input
                    disabled={!isEnabled || !item.editable}
                    id={item.key}
                    inputMode="tel"
                    maxLength={15}
                    placeholder={item.placeholder}
                    value={contacts[item.key]}
                    onChange={(event) =>
                      handleContactChange(item.key, event.target.value)
                    }
                    className="h-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/20 text-sm font-medium pr-10"
                  />
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
    </Card>
  );
}

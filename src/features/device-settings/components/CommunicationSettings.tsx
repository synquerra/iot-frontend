import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateDevicePhoneNumbers,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Phone, Save, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  selectedImei: string;
  latestSettings: LatestDeviceSettingsRecord | null;
  isLoadingLatestSettings: boolean;
};

type FormState = {
  phonenum1: string;
  phonenum2: string;
  controlroomnum: string;
};

const DEFAULTS: FormState = { phonenum1: "", phonenum2: "", controlroomnum: "" };

const CONTACT_CONFIG = [
  {
    key: "phonenum1" as const,
    label: "Primary Contact",
    placeholder: "+XX XXX XXX XXXX",
    badge: "Guardian 1",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: UserCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "phonenum2" as const,
    label: "Secondary Contact",
    placeholder: "+XX XXX XXX XXXX",
    badge: "Guardian 2",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    icon: ShieldCheck,
    iconClass: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    key: "controlroomnum" as const,
    label: "Emergency Line",
    placeholder: "Control room number",
    badge: "SOS",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    icon: AlertTriangle,
    iconClass: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-500/10",
  },
];

export function CommunicationSettings({ selectedImei, latestSettings }: Props) {
  const [contacts, setContacts] = useState<FormState>(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);
  const { setIsLoading } = useGlobalLoading();
  const isEnabled = Boolean(selectedImei);

  useEffect(() => {
    setContacts({
      phonenum1: latestSettings?.raw_phonenum1 ?? "",
      phonenum2: latestSettings?.raw_phonenum2 ?? "",
      controlroomnum: latestSettings?.raw_controlroomnum ?? "",
    });
    setIsDirty(false);
  }, [latestSettings?.raw_phonenum1, latestSettings?.raw_phonenum2, latestSettings?.raw_controlroomnum]);

  const handleChange = (key: keyof FormState, value: string) => {
    setContacts((c) => ({ ...c, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!latestSettings?.topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsLoading(true, "Syncing contacts...");
      const response = await updateDevicePhoneNumbers({
        topic: latestSettings.topic,
        phonenum1: contacts.phonenum1,
        phonenum2: contacts.phonenum2,
        controlroomnum: contacts.controlroomnum,
      });
      if (response.status === "success") {
        toast.success(response.message || "Contacts synced successfully");
        setIsDirty(false);
      } else {
        toast.error(response.message || "Failed to sync contacts");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      "border-border shadow-sm bg-card",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wide">Emergency Contacts</CardTitle>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isEnabled}
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className="h-7 px-3 text-[10px] font-bold uppercase tracking-wide gap-1.5"
        >
          <Save className="h-3 w-3" />
          {isDirty ? "Sync" : "Saved"}
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {CONTACT_CONFIG.map((item) => {
          const Icon = item.icon;
          const val = contacts[item.key];
          const hasValue = Boolean(val);
          return (
            <div key={item.key} className={cn(
              "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
              hasValue
                ? "border-border/80 bg-muted/10"
                : "border-dashed border-border/40 bg-muted/5 hover:border-border/60"
            )}>
              {/* Icon */}
              <div className={cn("p-2 rounded-lg flex-shrink-0", item.iconBg)}>
                <Icon className={cn("h-4 w-4", item.iconClass)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</span>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-3.5 font-bold border", item.badgeClass)}>
                    {item.badge}
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    disabled={!isEnabled}
                    id={item.key}
                    inputMode="tel"
                    maxLength={15}
                    placeholder={item.placeholder}
                    value={contacts[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="h-8 text-xs font-mono bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 pr-8"
                  />
                  {hasValue && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <p className="text-[10px] text-muted-foreground/60 pt-1 text-center">
          Numbers are transmitted securely via MQTT to the device
        </p>
      </CardContent>
    </Card>
  );
}

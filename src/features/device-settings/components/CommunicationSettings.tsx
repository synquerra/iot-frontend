import { Card, Box, Text, Badge, Button, TextInput, Group } from "@mantine/core";
import {
  updateDevicePhoneNumbers,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Phone, Save, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
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
    badgeColor: "green",
    icon: UserCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "phonenum2" as const,
    label: "Secondary Contact",
    placeholder: "+XX XXX XXX XXXX",
    badge: "Guardian 2",
    badgeColor: "blue",
    icon: ShieldCheck,
    iconClass: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    key: "controlroomnum" as const,
    label: "Emergency Line",
    placeholder: "Control room number",
    badge: "SOS",
    badgeColor: "red",
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
    <Card shadow="sm" radius="md" withBorder padding={0} className={cn(
      "bg-card",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <Group justify="space-between" align="center" className="py-3 px-4 border-b border-border">
        <Group gap="sm" align="center">
          <Phone className="h-4 w-4 text-primary" />
          <Text size="xs" fw={700} tt="uppercase" className="tracking-wide">Emergency Contacts</Text>
        </Group>
        <Button
          onClick={handleSave}
          disabled={!isEnabled}
          size="xs"
          variant={isDirty ? "filled" : "outline"}
          leftSection={<Save className="h-3 w-3" />}
          className="font-bold uppercase tracking-wide"
        >
          {isDirty ? "Sync" : "Saved"}
        </Button>
      </Group>

      <Box className="p-4 space-y-2">
        {CONTACT_CONFIG.map((item) => {
          const Icon = item.icon;
          const val = contacts[item.key];
          const hasValue = Boolean(val);
          return (
            <Group key={item.key} gap="md" wrap="nowrap" align="center" className={cn(
              "p-2.5 rounded-xl border transition-all",
              hasValue
                ? "border-border/80 bg-muted/10"
                : "border-dashed border-border/40 bg-muted/5 hover:border-border/60"
            )}>
              {/* Icon */}
              <Box className={cn("p-2 rounded-lg flex-shrink-0", item.iconBg)}>
                <Icon className={cn("h-4 w-4", item.iconClass)} />
              </Box>

              {/* Content */}
              <Box className="flex-1 min-w-0">
                <Group gap="sm" align="center" className="mb-1" wrap="nowrap">
                  <Text size="0.65rem" fw={700} c="dimmed" tt="uppercase" className="tracking-wide">{item.label}</Text>
                  <Badge variant="light" color={item.badgeColor} size="xs" className="font-bold border">
                    {item.badge}
                  </Badge>
                </Group>
                <Box className="relative">
                  <TextInput
                    disabled={!isEnabled}
                    id={item.key}
                    inputMode="tel"
                    maxLength={15}
                    placeholder={item.placeholder}
                    value={contacts[item.key]}
                    onChange={(e) => handleChange(item.key, e.currentTarget.value)}
                    styles={{ input: { height: '2rem', fontSize: '0.75rem', fontFamily: 'monospace' } }}
                    className="pr-8"
                  />
                  {hasValue && (
                    <Box className="absolute right-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </Box>
              </Box>
            </Group>
          );
        })}

        <Text size="0.65rem" c="dimmed" ta="center" className="pt-1">
          Numbers are transmitted securely via MQTT to the device
        </Text>
      </Box>
    </Card>
  );
}

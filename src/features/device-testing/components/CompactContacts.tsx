import { Card, Button, Box, Group, Text, TextInput } from "@mantine/core";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";
import { updateDevicePhoneNumbers } from "@/features/device-settings/services/deviceSettingsService";

export function CompactContacts({ latestSettings }: { latestSettings: LatestDeviceSettingsRecord | null }) {
  const { setIsLoading } = useGlobalLoading();
  const [phones, setPhones] = useState({ p1: "", p2: "", sos: "" });

  useEffect(() => {
    if (latestSettings) {
      setPhones({
        p1: latestSettings.raw_phonenum1 ?? "",
        p2: latestSettings.raw_phonenum2 ?? "",
        sos: latestSettings.raw_controlroomnum ?? "",
      });
    }
  }, [latestSettings]);

  const handleUpdate = async () => {
    if (!latestSettings?.topic) return;
    try {
      setIsLoading(true, "Updating contacts...");
      await updateDevicePhoneNumbers({
        topic: latestSettings.topic,
        phonenum1: phones.p1,
        phonenum2: phones.p2,
        controlroomnum: phones.sos,
      });
      toast.success("Device contacts synchronized");
    } catch (error) {
      toast.error("Failed to update contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: "Primary No", key: "p1" as const },
    { label: "Secondary No", key: "p2" as const },
    { label: "Emergency No", key: "sos" as const },
  ];

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden p-0">
      <Group justify="space-between" align="center" className="py-2.5 px-4 bg-muted/30 border-b border-primary/5">
        <Text size="xs" fw={700} className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-primary" />
          Device Contacts
        </Text>
      </Group>
      <Box className="p-3 space-y-3">
        <div className="space-y-2">
           {fields.map(f => (
             <div key={f.key} className="space-y-1">
               <Text size="0.55rem" fw={900} tt="uppercase" className="text-muted-foreground">{f.label}</Text>
               <TextInput 
                  value={phones[f.key]} 
                  onChange={e => setPhones(p => ({ ...p, [f.key]: e.target.value }))}
                  styles={{ input: { height: '1.75rem', fontSize: '0.625rem', fontFamily: 'monospace', borderRadius: '0.375rem' } }}
               />
             </div>
           ))}
        </div>
        <Button onClick={handleUpdate} color="teal" size="sm" className="w-full h-8 text-[10px] font-bold">
          Sync Contact Info
        </Button>
      </Box>
    </Card>
  );
}

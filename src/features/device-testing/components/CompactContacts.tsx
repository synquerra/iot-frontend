import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";

import { updateDevicePhoneNumbers } from "@/features/device-settings/services/deviceSettingsService";

export function CompactContacts({ latestSettings }: { latestSettings: LatestDeviceSettingsRecord | null }) {
  const { setIsLoading } = useGlobalLoading();
  const [phones, setPhones] = useState({ p1: "", p2: "" });

  useEffect(() => {
    if (latestSettings) {
      setPhones({
        p1: latestSettings.raw_phonenum1 ?? "",
        p2: latestSettings.raw_phonenum2 ?? "",
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
        controlroomnum: latestSettings.raw_controlroomnum || "",
      });
      toast.success("Contacts updated successfully");
    } catch (error) {
      toast.error("Failed to update contacts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-primary/5">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-primary" />
          Set Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
           <div className="space-y-1">
             <label className="text-[9px] font-bold text-muted-foreground uppercase">Phone No. 1</label>
             <Input 
                value={phones.p1} 
                onChange={e => setPhones(p => ({ ...p, p1: e.target.value }))}
                className="h-7 text-[10px] font-mono bg-muted/50"
                disabled
             />
           </div>
           <div className="space-y-1">
             <label className="text-[9px] font-bold text-muted-foreground uppercase">Phone No. 2</label>
             <Input 
                value={phones.p2} 
                onChange={e => setPhones(p => ({ ...p, p2: e.target.value }))}
                className="h-7 text-[10px] font-mono bg-muted/50"
                disabled
             />
           </div>
        </div>
        <Button onClick={handleUpdate} size="sm" className="w-full h-8 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none" disabled>
          Sync Phone Numbers
        </Button>
      </CardContent>
    </Card>
  );
}

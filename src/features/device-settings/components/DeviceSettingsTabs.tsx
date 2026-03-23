import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";
import { tabs } from "../constants";
import { AdvancedSettings } from "./AdvancedSettings";
import { CommunicationSettings } from "./CommunicationSettings";
import { IntervalsSettings } from "./IntervalsSettings";
import { ModesSettings } from "./ModesSettings";

type DeviceSettingsTabsProps = {
  selectedImei: string;
  latestSettings: LatestDeviceSettingsRecord | null;
  isLoadingLatestSettings: boolean;
};

export function DeviceSettingsTabs({
  selectedImei,
  latestSettings,
  isLoadingLatestSettings,
}: DeviceSettingsTabsProps) {
  return (
    <Tabs defaultValue="communication" className="flex flex-col md:flex-row gap-8">
      <TabsList className="flex flex-col h-auto justify-start bg-transparent p-0 w-full md:w-64 space-y-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-full justify-start gap-3 px-4 py-2.5 text-left text-muted-foreground hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none transition-colors rounded-lg"
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 min-w-0">
        <TabsContent value="communication" className="m-0 space-y-6">
        <CommunicationSettings
          selectedImei={selectedImei}
          latestSettings={latestSettings}
          isLoadingLatestSettings={isLoadingLatestSettings}
        />
        </TabsContent>

        <TabsContent value="intervals" className="m-0 space-y-6">
        <IntervalsSettings
          selectedImei={selectedImei}
          latestSettings={latestSettings}
        />
        </TabsContent>

        <TabsContent value="modes" className="m-0 space-y-6">
        <ModesSettings selectedImei={selectedImei} />
        </TabsContent>

        <TabsContent value="advanced" className="m-0 space-y-6">
        <AdvancedSettings />
        </TabsContent>
      </div>
    </Tabs>
  );
}

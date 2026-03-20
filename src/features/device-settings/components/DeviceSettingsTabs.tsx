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
    <Tabs defaultValue="communication" className="space-y-6">
      <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <tab.icon size={16} />
            <span className="hidden md:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="communication" className="space-y-6">
        <CommunicationSettings
          selectedImei={selectedImei}
          latestSettings={latestSettings}
          isLoadingLatestSettings={isLoadingLatestSettings}
        />
      </TabsContent>

      <TabsContent value="intervals" className="space-y-6">
        <IntervalsSettings
          selectedImei={selectedImei}
          latestSettings={latestSettings}
        />
      </TabsContent>

      <TabsContent value="modes" className="space-y-6">
        <ModesSettings selectedImei={selectedImei} />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <AdvancedSettings />
      </TabsContent>
    </Tabs>
  );
}

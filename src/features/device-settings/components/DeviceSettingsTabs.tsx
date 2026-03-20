import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabs } from "../constants";
import { AdvancedSettings } from "./AdvancedSettings";
import { CommunicationSettings } from "./CommunicationSettings";
import { IntervalsSettings } from "./IntervalsSettings";
import { ModesSettings } from "./ModesSettings";
import { SafetySettings } from "./SafetySettings";

type DeviceSettingsTabsProps = {
  selectedImei: string;
};

export function DeviceSettingsTabs({ selectedImei }: DeviceSettingsTabsProps) {
  return (
    <Tabs defaultValue="communication" className="space-y-6">
      <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-5">
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
        <CommunicationSettings />
      </TabsContent>

      <TabsContent value="intervals" className="space-y-6">
        <IntervalsSettings selectedImei={selectedImei} />
      </TabsContent>

      <TabsContent value="safety" className="space-y-6">
        <SafetySettings />
      </TabsContent>

      <TabsContent value="modes" className="space-y-6">
        <ModesSettings />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <AdvancedSettings />
      </TabsContent>
    </Tabs>
  );
}

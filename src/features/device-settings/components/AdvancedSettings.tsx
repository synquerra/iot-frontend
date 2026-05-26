import {
  Card,
  Box,
  Text,
  Switch,
  TextInput,
  Group
} from "@mantine/core";
import { featureToggleItems, powerItems, deprecatedItems } from "../constants";
import { cn } from "@/lib/utils";

type AdvancedSettingsProps = {
  selectedImei: string;
};

export function AdvancedSettings({ selectedImei }: AdvancedSettingsProps) {
  const isEnabled = Boolean(selectedImei);
  const commsSettings = [...powerItems.filter(i => i.label.includes("Call")), ...featureToggleItems.filter(i => i.label.includes("Call"))];
  const systemSettings = powerItems.filter(i => !i.label.includes("Call"));

  return (
    <Card shadow="sm" radius="md" withBorder padding={0} className={cn(
      "transition-opacity duration-300",
      !isEnabled && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <Box className="py-3 px-4 border-b border-border bg-muted/5">
        <Text size="sm" fw={700} tt="uppercase" className="tracking-tight">
          Advanced System Config
        </Text>
        <Text size="0.6rem" fw={700} tt="uppercase" className="tracking-widest" c="dimmed">
          {!isEnabled 
            ? "Select device to configure" 
            : "Operational connectivity parameters"}
        </Text>
      </Box>

      <Box className="pt-8 p-4">
        <Box className="space-y-12">
          {/* Main Controls Grid */}
          <Box className="grid gap-12 md:grid-cols-2">
            
            {/* Communication Controls */}
            <Box className="space-y-6">
              <Group gap={8} align="center">
                <Box className="h-4 w-1 bg-blue-500 rounded-full" />
                <Text size="xs" fw={900} tt="uppercase" className="tracking-[0.2em]" c="dimmed">Communication Controls</Text>
              </Group>
              <Box className="space-y-2">
                {commsSettings.map((item) => (
                  <Group
                    key={item.label}
                    justify="space-between"
                    align="center"
                    wrap="nowrap"
                    className="rounded-xl p-4 bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all"
                  >
                    <Group gap="sm" align="center" wrap="nowrap">
                      <Box className="rounded-lg bg-blue-500/10 p-2">
                        <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </Box>
                      <Box>
                        <Text size="sm" fw={700} className="tracking-tight">{item.label}</Text>
                        <Text size="0.65rem" fw={500} tt="uppercase" c="dimmed" className="tracking-wide">
                          {item.description}
                        </Text>
                      </Box>
                    </Group>
                    {'enabled' in item && <Switch defaultChecked={item.enabled} />}
                  </Group>
                ))}
              </Box>
            </Box>

            {/* System Parameters */}
            <Box className="space-y-6">
              <Group gap={8} align="center">
                <Box className="h-4 w-1 bg-orange-500 rounded-full" />
                <Text size="xs" fw={900} tt="uppercase" className="tracking-[0.2em]" c="dimmed">System Parameters</Text>
              </Group>
              <Box className="space-y-2">
                {systemSettings.map((item) => (
                  <Group
                    key={item.label}
                    justify="space-between"
                    align="center"
                    wrap="nowrap"
                    className="rounded-xl p-4 bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all"
                  >
                    <Group gap="sm" align="center" wrap="nowrap">
                      <Box className="rounded-lg bg-orange-500/10 p-2">
                        <item.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </Box>
                      <Box>
                        <Text size="sm" fw={700} className="tracking-tight">{item.label}</Text>
                        <Text size="0.65rem" fw={500} tt="uppercase" c="dimmed" className="tracking-wide">
                          {item.description}
                        </Text>
                      </Box>
                    </Group>
                    {item.input ? (
                      <TextInput size="xs" w={80} styles={{ input: { textAlign: 'center', fontWeight: 900 } }} defaultValue={item.value} />
                    ) : (
                      <Switch defaultChecked={item.enabled} />
                    )}
                  </Group>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Deprecated/Restricted Subsection */}
          <Box className="pt-10 mt-10 border-t border-dashed relative border-border">
            <Box className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-background">
              <Text size="0.65rem" fw={900} tt="uppercase" className="tracking-[0.3em] opacity-30" c="dimmed">
                Restricted Maintenance Access
              </Text>
            </Box>

            <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {deprecatedItems.map((item) => (
                <Group
                  key={item.label}
                  justify="space-between"
                  align="center"
                  wrap="nowrap"
                  className="rounded-xl border border-border/30 bg-muted/10 p-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                >
                  <Group gap="sm" align="center" wrap="nowrap">
                    <Box className="rounded-lg bg-background/50 p-1.5 border border-border/50">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </Box>
                    <Text size="0.7rem" fw={700} c="dimmed" className="tracking-tight leading-tight">{item.label}</Text>
                  </Group>
                  <Switch disabled defaultChecked={false} size="xs" />
                </Group>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

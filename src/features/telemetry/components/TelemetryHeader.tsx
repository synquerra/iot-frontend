import { ActionIcon, Button, Group, Title, Text, Badge, ThemeIcon, Paper, Stack } from "@mantine/core";
import { ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TelemetryHeaderProps {
  imei?: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function TelemetryHeader({ imei, isLoading, onRefresh }: TelemetryHeaderProps) {
  const navigate = useNavigate();

  return (
    <Paper className="bg-card/30 p-6 rounded-2xl border border-primary/5 shadow-sm" bg="transparent">
      <Group justify="space-between" align="center">
        <Group gap="lg">
          <ActionIcon 
            variant="default" 
            size="xl" 
            radius="xl"
            onClick={() => navigate(-1)} 
          >
            <ArrowLeft size="1.25rem" />
          </ActionIcon>
          <Stack gap={4}>
            <Group gap="sm">
              <ThemeIcon variant="light" size="lg" radius="md">
                <Activity size="1.25rem" />
              </ThemeIcon>
              <Title order={2} className="tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Telemetry Analytics
              </Title>
            </Group>
            <Group gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Deep packet analysis for device:
              </Text>
              <Badge variant="light" ff="monospace" size="sm">
                {imei}
              </Badge>
            </Group>
          </Stack>
        </Group>
        
        <Group gap="sm">
          <Button 
            onClick={onRefresh} 
            loading={isLoading} 
            variant="default" 
            leftSection={<RefreshCw size="1rem" />}
            className="font-bold uppercase text-[10px] tracking-widest"
          >
            Force Refresh
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

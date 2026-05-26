import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Battery,
  Cpu,
  MapPin,
  RefreshCw,
  Signal,
  TrendingUp,
  Wifi,
  AlertCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { listDevices, type Device } from "@/features/devices/services/deviceService";
import { toast } from "@/lib/toast";

import { PageHeader } from "@/components/PageHeader";
import {
  Button,
  Card,
  Text,
  Badge,
  Skeleton,
  SimpleGrid,
  Grid,
  Group,
  Stack,
  ThemeIcon,
  Progress,
  ActionIcon,
  Box,
  UnstyledButton,
} from "@mantine/core";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadDevices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const data = await listDevices();
      setDevices(data);
    } catch {
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDevices(); }, []);

  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter(d => d.status === "active").length;
    const inactive = devices.filter(d => d.status === "inactive").length;
    const withBattery = devices.filter(d => d.battery && Number(d.battery) < 20).length;
    return { total, active, inactive, lowBattery: withBattery };
  }, [devices]);

  const recentDevices = useMemo(() =>
    [...devices].sort((a, b) => {
      const at = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bt - at;
    }).slice(0, 6),
    [devices]
  );

  const formatTime = (ts?: string | null) => {
    if (!ts) return "No data yet";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(new Date(ts));
    } catch { return "Unknown"; }
  };

  const statCards = [
    {
      label: "Total Devices",
      value: stats.total,
      icon: Cpu,
      color: "blue",
      description: "Registered in fleet",
    },
    {
      label: "Active",
      value: stats.active,
      icon: Activity,
      color: "teal",
      description: "Currently transmitting",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: Signal,
      color: "gray",
      description: "Not transmitting",
    },
    {
      label: "Low Battery",
      value: stats.lowBattery,
      icon: Battery,
      color: "red",
      description: "Below 20% charge",
    },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title="Fleet Overview"
        description="Real-time monitoring and analytics command center"
        icon={TrendingUp}
      >
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => loadDevices(true)}
          loading={refreshing}
        >
          <RefreshCw size="1.2rem" />
        </ActionIcon>
      </PageHeader>

      {/* Phase 2 Notice */}
      <Card withBorder padding="sm" radius="md" bg="blue.0" className="dark:bg-blue-900/20">
        <Group wrap="nowrap" align="center">
          <ThemeIcon size="lg" variant="light" color="blue" radius="md">
            <TrendingUp size="1.2rem" />
          </ThemeIcon>
          <Box flex={1}>
            <Text size="sm" fw={700} c="blue.9" className="dark:text-blue-200">
              Analytics Center — Coming in Phase 2
            </Text>
            <Text size="xs" c="blue.8" className="dark:text-blue-300 mt-0.5">
              Trip history, heat maps, and custom reporting will be available in the next major update.
            </Text>
          </Box>
          <Badge variant="light" color="blue">Phase 2</Badge>
        </Group>
      </Card>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height={110} radius="md" />)
          : statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} withBorder radius="md" padding="md" shadow="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                      {card.label}
                    </Text>
                    <Text size="xl" fw={700} lh={1}>
                      {card.value}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4} className="hidden sm:block">
                      {card.description}
                    </Text>
                  </div>
                  <ThemeIcon variant="light" color={card.color} size="lg" radius="md">
                    <Icon size="1.2rem" />
                  </ThemeIcon>
                </Group>
              </Card>
            );
          })}
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid>
        {/* Recent Devices */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder radius="md" shadow="sm" h="100%" p={0}>
            <Group justify="space-between" p="md" className="border-b border-border">
              <Group gap="xs">
                <Wifi size="1.2rem" className="text-blue-500" />
                <Text size="sm" fw={700} tt="uppercase">
                  Recent Activity
                </Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  onClick={() => loadDevices(true)}
                  loading={refreshing}
                >
                  <RefreshCw size="1.1rem" />
                </ActionIcon>
                <Button variant="light" size="xs" onClick={() => navigate("/devices/list")}>
                  View All
                </Button>
              </Group>
            </Group>

            <Box>
              {loading ? (
                <Stack p="md" gap="sm">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} height={50} radius="md" />)}
                </Stack>
              ) : recentDevices.length === 0 ? (
                <Stack align="center" justify="center" py="xl" c="dimmed">
                  <Cpu size="2.5rem" opacity={0.2} />
                  <Text size="sm" fw={500}>No devices registered yet</Text>
                </Stack>
              ) : (
                <Stack gap={0} className="divide-y divide-border">
                  {recentDevices.map((device) => (
                    <UnstyledButton
                      key={device.imei}
                      onClick={() => navigate(`/devices/${device.imei}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <Box
                        w={10}
                        h={10}
                        className={`rounded-full flex-shrink-0 ${
                          device.status === "active" ? "bg-teal-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                      <Box flex={1} style={{ overflow: "hidden" }}>
                        <Text size="sm" fw={600} truncate>
                          {device.displayName}
                        </Text>
                        <Group gap="md" mt={2}>
                          <Text size="xs" ff="monospace" c="dimmed">
                            {device.imei}
                          </Text>
                          {device.battery && (
                            <Group gap={2}>
                              <Battery size="0.8rem" className={Number(device.battery) < 20 ? "text-red-500" : "text-gray-400"} />
                              <Text size="xs" fw={700} c={Number(device.battery) < 20 ? "red" : "dimmed"}>
                                {device.battery}%
                              </Text>
                            </Group>
                          )}
                          {device.geoid && device.geoid !== "10" && device.geoid !== "11" && (
                            <Group gap={2}>
                              <MapPin size="0.8rem" className="text-blue-500" />
                              <Text size="xs" fw={700} c="blue">
                                {device.geoid}
                              </Text>
                            </Group>
                          )}
                        </Group>
                      </Box>
                      <Group gap="sm" wrap="nowrap">
                        {device.timestamp && (
                          <Group gap={4} className="hidden sm:flex text-gray-400">
                            <Clock size="0.8rem" />
                            <Text size="xs">{formatTime(device.timestamp)}</Text>
                          </Group>
                        )}
                        <ChevronRight size="1rem" className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </Group>
                    </UnstyledButton>
                  ))}
                </Stack>
              )}
            </Box>
          </Card>
        </Grid.Col>

        {/* Fleet Overview Panel */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* Status Breakdown */}
            <Card withBorder radius="md" shadow="sm" p={0}>
              <Box p="md" className="border-b border-border">
                <Group gap="xs">
                  <AlertCircle size="1.2rem" className="text-blue-500" />
                  <Text size="sm" fw={700} tt="uppercase">
                    Fleet Status
                  </Text>
                </Group>
              </Box>
              <Stack p="md" gap="md">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} height={30} radius="sm" />)
                ) : (
                  <>
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Group gap="xs">
                          <Box w={8} h={8} className="rounded-full bg-teal-500" />
                          <Text size="sm" fw={500}>Active</Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="sm" fw={700}>{stats.active}</Text>
                          <Text size="xs" c="dimmed">
                            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                          </Text>
                        </Group>
                      </Group>
                      <Progress
                        value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0}
                        color="teal"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Group gap="xs">
                          <Box w={8} h={8} className="rounded-full bg-gray-400" />
                          <Text size="sm" fw={500}>Inactive</Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="sm" fw={700}>{stats.inactive}</Text>
                          <Text size="xs" c="dimmed">
                            {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%
                          </Text>
                        </Group>
                      </Group>
                      <Progress
                        value={stats.total > 0 ? (stats.inactive / stats.total) * 100 : 0}
                        color="gray"
                        size="sm"
                      />
                    </Box>

                    {stats.lowBattery > 0 && (
                      <Group justify="space-between" p="sm" bg="red.0" className="rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-900/30">
                        <Group gap="xs">
                          <Battery size="1rem" className="text-red-500" />
                          <Text size="sm" fw={500} c="red.7" className="dark:text-red-400">
                            Low Battery Alert
                          </Text>
                        </Group>
                        <Badge color="red" variant="filled">
                          {stats.lowBattery} device{stats.lowBattery !== 1 ? "s" : ""}
                        </Badge>
                      </Group>
                    )}
                  </>
                )}
              </Stack>
            </Card>

            {/* Quick Navigation */}
            <Card withBorder radius="md" shadow="sm" p={0}>
              <Box p="md" className="border-b border-border">
                <Text size="sm" fw={700} tt="uppercase">Quick Actions</Text>
              </Box>
              <Stack p="xs" gap="xs">
                {[
                  { label: "Manage Devices", desc: "View and configure fleet", path: "/devices/list", icon: Cpu },
                  { label: "Device Settings", desc: "Configure telemetry params", path: "/devices/settings", icon: Signal },
                  { label: "Geofencing", desc: "Manage zone boundaries", path: "/devices/geofencing", icon: MapPin },
                  { label: "Alerts & Errors", desc: "Review system events", path: "/alerts", icon: AlertCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <UnstyledButton
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <ThemeIcon variant="light" color="gray" size="lg" className="group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                        <Icon size="1.1rem" className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                      </ThemeIcon>
                      <Box flex={1}>
                        <Text size="sm" fw={700}>{item.label}</Text>
                        <Text size="xs" c="dimmed" truncate>{item.desc}</Text>
                      </Box>
                      <ChevronRight size="1rem" className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

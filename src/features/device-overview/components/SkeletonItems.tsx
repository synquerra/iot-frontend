import { Card, Box, Skeleton, Group } from "@mantine/core";

export const MetricCardSkeleton = () => (
  <Card radius="xl" withBorder padding={0} className="overflow-hidden">
    <Box className="p-6">
      <Group justify="space-between" align="flex-start">
        <Box className="space-y-2">
          <Skeleton height={16} width={80} radius="md" />
          <Skeleton height={32} width={64} radius="md" />
        </Box>
        <Skeleton height={48} width={48} circle />
      </Group>
      <Box className="mt-4 pt-3 border-t border-border">
        <Skeleton height={16} width={128} radius="md" />
      </Box>
    </Box>
  </Card>
);

export const StatusCardSkeleton = () => (
  <Card shadow="sm" radius="md" withBorder padding="md">
    <Box mb="md">
      <Group justify="space-between" align="center">
        <Skeleton height={16} width={96} radius="md" />
        <Skeleton height={20} width={64} radius="md" />
      </Group>
    </Box>
    <Box className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Box key={i} className="space-y-1.5">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <Skeleton height={16} width={16} circle />
              <Skeleton height={16} width={96} radius="md" />
            </Group>
            <Skeleton height={16} width={48} radius="md" />
          </Group>
          <Skeleton height={6} width="100%" radius="md" />
        </Box>
      ))}
    </Box>
  </Card>
);

export const ActivityCardSkeleton = () => (
  <Card shadow="sm" radius="md" withBorder padding="md">
    <Box mb="md">
      <Group justify="space-between" align="center">
        <Box>
          <Skeleton height={20} width={128} radius="md" />
          <Skeleton height={16} width={160} radius="md" mt={4} />
        </Box>
        <Skeleton height={32} width={80} radius="md" />
      </Group>
    </Box>
    <Box>
      <Box className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Box key={i} className="rounded-xl bg-muted/50 p-4">
            <Group justify="space-between" align="center">
              <Box>
                <Skeleton height={32} width={48} radius="md" />
                <Skeleton height={12} width={64} radius="md" mt={4} />
              </Box>
              <Skeleton height={32} width={32} circle />
            </Group>
          </Box>
        ))}
      </Box>
    </Box>
  </Card>
);

export const SidebarCardSkeleton = ({ lines = 2 }: { lines?: number }) => (
  <Card shadow="sm" radius="md" withBorder padding="md">
    <Box mb="md">
      <Skeleton height={20} width={128} radius="md" mb={4} />
      <Skeleton height={16} width={160} radius="md" />
    </Box>
    <Box className="space-y-4">
      {[...Array(lines)].map((_, i) => (
        <Group key={i} justify="space-between" align="center">
          <Group gap={12} align="center">
            <Skeleton height={32} width={32} radius="md" />
            <Skeleton height={16} width={96} radius="md" />
          </Group>
          <Skeleton height={20} width={64} radius="md" />
        </Group>
      ))}
    </Box>
  </Card>
);

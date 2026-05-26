import { useEffect, useState } from "react";
import { 
  Download, 
  History, 
  RefreshCw, 
  Package,
  Calendar,
  Plus,
  Edit2,
  Search
} from "lucide-react";
import { Button, Card, Table, Badge, Skeleton, ActionIcon, Stack, Group, Text, Center, TextInput, Box, Title } from "@mantine/core";
import { toast } from "@/lib/toast";
import { listFotaUpdates } from "./services/fotaService";
import type { FotaUpdate } from "./types";
import { FotaFormDialog } from "./components/FotaFormDialog";
import { PageHeader } from "@/components/PageHeader";

export default function FotaPage() {
  const [updates, setUpdates] = useState<FotaUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<FotaUpdate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const response = await listFotaUpdates();
      if (response.status === "success") {
        setUpdates(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch firmware updates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (isNaN(size)) return "Unknown";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  const filteredUpdates = updates.filter(u => 
    u.version_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.version_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="lg" className="animate-in fade-in duration-500">
      <PageHeader
        title="FOTA Updates"
        description="Available firmware updates and historical versions"
        icon={Package}
      >
        <Group gap="sm">
            {/* Version Search */}
            <TextInput
              placeholder="Search versions..."
              leftSection={<Search size="0.8rem" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              className="hidden md:block w-64"
            />

            <ActionIcon 
              onClick={fetchUpdates} 
              loading={isLoading}
              variant="default"
              size="lg"
            >
              <RefreshCw size="1.1rem" />
            </ActionIcon>
            
            <Button 
              onClick={() => {
                setEditingUpdate(null);
                setIsFormOpen(true);
              }}
              leftSection={<Plus size="1rem" />}
            >
              <span className="hidden sm:inline">Add Firmware</span>
            </Button>
        </Group>
      </PageHeader>

      {/* Latest Release Banner */}
      {updates.length > 0 && (
        <Card shadow="sm" radius="md" withBorder className="bg-primary/5 border-primary/20">
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <History size="1rem" className="text-primary" />
              <Title order={6} tt="uppercase" className="tracking-tight">
                Latest Release Note
              </Title>
            </Group>
            <Group gap="xs">
              <Badge color="blue" fw={900}>{updates[0].version_name}</Badge>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" className="flex items-center gap-1">
                <Calendar size="0.8rem" />
                {updates[0].created_at}
              </Text>
            </Group>
          </Group>
          <Text size="sm" fs="italic" c="dimmed" fw={500}>
            "{updates[0].release_notes}"
          </Text>
        </Card>
      )}

      <Stack gap="sm">
        <Box px={4}>
          <Text size="xs" fw={800} tt="uppercase" className="tracking-tight">
            Firmware Registry
          </Text>
          <Text size="xs" c="dimmed" tt="uppercase" className="tracking-widest opacity-50">
            Available updates and historical versions
          </Text>
        </Box>

        {isLoading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h={48} radius="md" />
            ))}
          </Stack>
        ) : filteredUpdates.length > 0 ? (
          <Box className="rounded-xl border border-border shadow-sm overflow-hidden" bg="var(--mantine-color-body)">
            <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
              <Table.Thead className="bg-slate-50 dark:bg-slate-900">
                <Table.Tr>
                  <Table.Th className="text-xs uppercase tracking-wider text-muted-foreground">Version</Table.Th>
                  <Table.Th className="text-xs uppercase tracking-wider text-muted-foreground">Build Code</Table.Th>
                  <Table.Th className="text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Size</Table.Th>
                  <Table.Th className="text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Released</Table.Th>
                  <Table.Th className="text-right text-xs uppercase tracking-wider text-muted-foreground">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUpdates.map((update) => (
                  <Table.Tr key={update.id}>
                    <Table.Td>
                      <Badge variant="light" color="gray" ff="monospace" size="sm">{update.version_name}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed" ff="monospace">{update.version_code}</Text>
                    </Table.Td>
                    <Table.Td className="hidden sm:table-cell">
                      <Text size="xs" c="dimmed">{formatFileSize(update.file_size)}</Text>
                    </Table.Td>
                    <Table.Td className="hidden md:table-cell">
                      <Text size="xs" c="dimmed">{update.created_at.split(' ')[0]}</Text>
                    </Table.Td>
                    <Table.Td className="text-right">
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => {
                            setEditingUpdate(update);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit2 size="1rem" />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          color="gray" 
                          component="a" 
                          href={update.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Download size="1rem" />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        ) : (
          <Center py={48} className="flex-col border-2 border-dashed border-border rounded-xl bg-muted/5">
             <History size="3rem" className="text-muted-foreground opacity-20 mb-4" />
             <Text fw={700} size="lg">No Firmware Found</Text>
             <Text size="sm" c="dimmed">The FOTA update registry is currently empty.</Text>
          </Center>
        )}
      </Stack>

      <FotaFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchUpdates}
        editData={editingUpdate}
      />
    </Stack>
  );
}

import { TextInput, Button, ActionIcon, Group, Box, Text } from "@mantine/core"
import { useDeviceTable } from "../context/DeviceTableContext"
import { Search, X, RefreshCw, Plus } from "lucide-react"
import { AddDeviceModal } from "./AddDeviceModal"

export function DeviceToolbar() {
    const {
        search,
        setSearch,
        refresh,
        selected,
        clearSelection,
    } = useDeviceTable()

    return (
        <Box className="space-y-3">
            {/* Top row - always visible */}
            <Group justify="space-between" align="center" gap="sm">
                {/* Search - takes most space */}
                <Box className="flex-1 max-w-md">
                    <TextInput
                        placeholder="Search devices..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<Search size="0.9rem" className="text-muted-foreground" />}
                        rightSection={search ? (
                            <ActionIcon variant="subtle" color="gray" onClick={() => setSearch("")}>
                                <X size="0.9rem" />
                            </ActionIcon>
                        ) : null}
                    />
                </Box>

                {/* Mobile buttons */}
                <Group gap="xs" className="sm:hidden">
                    <ActionIcon variant="default" size="lg" onClick={refresh}>
                        <RefreshCw size="1rem" />
                    </ActionIcon>
                    <AddDeviceModal>
                        <ActionIcon variant="filled" color="blue" size="lg">
                            <Plus size="1rem" />
                        </ActionIcon>
                    </AddDeviceModal>
                </Group>

                {/* Desktop buttons */}
                <Group gap="sm" className="hidden sm:flex">
                    <Button variant="default" onClick={refresh} leftSection={<RefreshCw size="1rem" />}>
                        Refresh
                    </Button>
                    <AddDeviceModal>
                        <Button leftSection={<Plus size="1rem" />}>
                            Add Device
                        </Button>
                    </AddDeviceModal>
                </Group>
            </Group>

            {/* Selection bar */}
            {selected.length > 0 && (
                <Group justify="space-between" className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    <Text size="sm" c="red" fw={500}>
                        {selected.length} selected
                    </Text>
                    <Button
                        color="red"
                        size="xs"
                        onClick={clearSelection}
                        leftSection={<X size="0.8rem" />}
                    >
                        Clear
                    </Button>
                </Group>
            )}
        </Box>
    )
}
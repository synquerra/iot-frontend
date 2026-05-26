import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Table, Badge, Button, Menu, Group, Box, Center, Text } from "@mantine/core";
import { ChevronDown, ArrowUpDown, Settings2, Activity } from "lucide-react";
import type { TelemetryData } from "../hooks/useTelemetry";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const columns: ColumnDef<TelemetryData>[] = [
  {
    accessorKey: "deviceTimestamp",
    header: ({ column }) => (
      <Button
        variant="subtle"
        color="gray"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold uppercase text-[10px]"
        rightSection={<ArrowUpDown className="h-3 w-3" />}
      >
        Device Time
      </Button>
    ),
    cell: ({ row }) => (
      <Text ff="monospace" size="xs">
        {row.original.deviceTimestamp 
          ? formatDate(row.original.deviceTimestamp) 
          : row.original.deviceRawTimestamp || "-"}
      </Text>
    ),
  },
  {
    accessorKey: "packet",
    header: "Packet Type",
    cell: ({ row }) => (
      <Badge variant="outline" color="gray" size="sm" tt="uppercase" className="tracking-widest">
        {row.getValue("packet") || "UNK"}
      </Badge>
    ),
  },
  {
    id: "coordinates",
    header: "Lat / Lng",
    cell: ({ row }) => {
      const lat = row.original.latitude;
      const lng = row.original.longitude;
      return lat && lng ? (
        <Text c="dimmed" ff="monospace" size="xs">
          {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
        </Text>
      ) : <Text c="dimmed">-</Text>;
    },
  },
  {
    accessorKey: "speed",
    header: "Speed",
    cell: ({ row }) => <Text ff="monospace" size="xs">{row.getValue("speed") ? `${row.getValue("speed")} km/h` : "-"}</Text>,
  },
  {
    id: "power",
    header: "Bat / Sig",
    cell: ({ row }) => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Text span c="teal" fw={600} size="xs" ff="monospace">{row.original.battery ? `${row.original.battery}%` : "-"}</Text>
        <Text span c="blue" size="xs" ff="monospace">{row.original.signal ? `${row.original.signal} sig` : "-"}</Text>
      </Box>
    ),
  },
  {
    accessorKey: "rawTemperature",
    header: "Temp",
    cell: ({ row }) => <Text ff="monospace" size="xs">{String(row.getValue("rawTemperature") || "-")}</Text>,
  },
  {
    accessorKey: "geoid",
    header: "Geo Status",
    cell: ({ row }) => {
      const geoid = row.original.geoid;
      if (geoid === "10") {
        return <Text c="dimmed" ff="monospace" fs="italic" size="xs">Not in a geofence</Text>;
      }
      if (geoid === "11") {
        return <Badge color="orange" variant="light" size="sm" tt="uppercase">GPS Disabled</Badge>;
      }
      return <Text ff="monospace" size="xs">{geoid ? `ID: ${geoid}` : "-"}</Text>;
    },
  },
  {
    accessorKey: "alert",
    header: "Alert Status",
    cell: ({ row }) => {
      const alert = row.getValue("alert") as string;
      return alert && alert !== "normal" ? (
        <Badge color="red" size="sm" tt="uppercase">
          {alert}
        </Badge>
      ) : (
        <Text c="dimmed" ff="monospace" size="xs">Normal</Text>
      );
    },
  },
];

type Props = {
  data: TelemetryData[];
  loading: boolean;
};

export function TelemetryTable({ data, loading }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading && data.length === 0) {
    return (
      <Center py={48} className="rounded-md border border-border bg-muted/5 animate-pulse flex-col text-muted-foreground">
        <Activity size="2rem" className="opacity-20 mb-2" />
        <Text ff="monospace" size="xs" tt="uppercase" className="tracking-widest">
          Synchronizing live telemetry log stream...
        </Text>
      </Center>
    );
  }

  return (
    <Box className="w-full space-y-4">
      <Group justify="flex-end">
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Button variant="light" size="xs" leftSection={<Settings2 size="0.9rem" />} rightSection={<ChevronDown size="0.9rem" className="opacity-50" />}>
              Columns
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <Menu.Item
                    key={column.id}
                    className="capitalize text-xs"
                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    rightSection={column.getIsVisible() ? <Text size="xs">✓</Text> : null}
                  >
                    {column.id.replace(/([A-Z])/g, ' $1')}
                  </Menu.Item>
                );
              })}
          </Menu.Dropdown>
        </Menu>
      </Group>
      
      <Box className="rounded-xl border border-border shadow-sm overflow-hidden" bg="var(--mantine-color-body)">
        <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
          <Table.Thead className="bg-slate-50 dark:bg-slate-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.Th key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id} className="text-[11px] whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl" className="text-muted-foreground">
                    <Text ff="monospace" fs="italic" size="sm">No telemetry data packets found.</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="space-between" px="xs">
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" className="tracking-widest">
          Displaying {data.length} Real-time Packets
        </Text>
        <Group gap="xs">
          <Button
            variant="default"
            size="xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-[10px] font-bold uppercase tracking-tighter"
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-[10px] font-bold uppercase tracking-tighter"
          >
            Next
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

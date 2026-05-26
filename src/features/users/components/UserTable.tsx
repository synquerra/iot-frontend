import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Table, Badge, Menu, ActionIcon, Button, Group, Text, Box, Center } from "@mantine/core";
import { MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import { type User } from "../types";

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
}

const columnHelper = createColumnHelper<User>();

export function UserTable({ data, onEdit, onDelete, onAdd }: UserTableProps) {

  const columns = [
    columnHelper.accessor("first_name", {
      header: "Name",
      cell: (info) => {
        const user = info.row.original;
        return (
          <Box>
            <Text size="sm" fw={500}>{`${user.first_name} ${user.last_name}`}</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </Box>
        );
      },
    }),
    columnHelper.accessor("mobile", {
      header: "Mobile",
      cell: (info) => <Text ff="monospace" size="xs">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("user_type", {
      header: "Type",
      cell: (info) => (
        <Badge variant="light" color="gray" size="sm" tt="uppercase" fw={700}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: (info) => (
        <Badge
          color={info.getValue() ? "teal" : "red"}
          variant="filled"
          size="sm"
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => {
        const user = info.row.original;
        return (
          <Menu position="bottom-end" withArrow shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <MoreHorizontal size="1rem" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Edit size="1rem" />}
                onClick={() => onEdit(user)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={<Trash2 size="1rem" />}
                color="red"
                onClick={() => onDelete(user.user_id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Box>
      <Box className="rounded-xl border border-border shadow-sm overflow-hidden" bg="var(--mantine-color-body)">
        <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
          <Table.Thead className="bg-slate-50 dark:bg-slate-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl" className="flex-col text-muted-foreground">
                    <Users size="2rem" className="opacity-20 mb-2" />
                    <Text size="sm" fw={500}>No users found.</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="space-between" mt="md" px="xs">
        <Text size="xs" c="dimmed" fw={500}>
          Showing {table.getRowModel().rows.length} users
        </Text>
        <Group gap="xs">
          <Button
            variant="default"
            size="xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

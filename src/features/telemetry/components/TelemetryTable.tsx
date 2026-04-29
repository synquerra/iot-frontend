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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUpDown, Settings2 } from "lucide-react";
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
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold uppercase text-[10px]"
      >
        Device Time
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono">
        {row.original.deviceTimestamp 
          ? formatDate(row.original.deviceTimestamp) 
          : row.original.deviceRawTimestamp || "-"}
      </div>
    ),
  },
  {
    accessorKey: "packet",
    header: "Packet Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] h-5 tracking-widest uppercase">
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
        <span className="text-muted-foreground font-mono">
          {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
        </span>
      ) : "-";
    },
  },
  {
    accessorKey: "speed",
    header: "Speed",
    cell: ({ row }) => <div className="font-mono">{row.getValue("speed") ? `${row.getValue("speed")} km/h` : "-"}</div>,
  },
  {
    id: "power",
    header: "Bat / Sig",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 font-mono">
        <span className="text-green-600 dark:text-green-400 font-semibold">{row.original.battery ? `${row.original.battery}%` : "-"}</span>
        <span className="text-blue-600 dark:text-blue-400">{row.original.signal ? `${row.original.signal} sig` : "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "rawTemperature",
    header: "Temp",
    cell: ({ row }) => <div className="font-mono">{row.getValue("rawTemperature") || "-"}</div>,
  },
  {
    accessorKey: "alert",
    header: "Alert Status",
    cell: ({ row }) => {
      const alert = row.getValue("alert") as string;
      return alert && alert !== "normal" ? (
        <Badge variant="destructive" className="h-5 text-[10px] uppercase">
          {alert}
        </Badge>
      ) : (
        <span className="text-muted-foreground font-mono">Normal</span>
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
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground animate-pulse font-mono uppercase text-xs tracking-widest">
        Synchronizing live telemetry log stream...
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
              <Settings2 className="h-3.5 w-3.5" />
              Columns
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/([A-Z])/g, ' $1')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 border-b border-primary/5">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-[11px] whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-mono italic">
                  No telemetry data packets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Displaying {data.length} Real-time Packets
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

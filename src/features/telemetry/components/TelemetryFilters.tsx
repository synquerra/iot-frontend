import { Button, TextInput, Select, SimpleGrid, Group } from "@mantine/core";
import { Calendar, Filter, ListFilter } from "lucide-react";

interface TelemetryFiltersProps {
  startDate: string;
  endDate: string;
  limit: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onReset: () => void;
}

export function TelemetryFilters({
  startDate,
  endDate,
  limit,
  onStartDateChange,
  onEndDateChange,
  onLimitChange,
  onReset
}: TelemetryFiltersProps) {
  return (
    <div className="bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-primary/10 shadow-lg">
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md" verticalSpacing="md" className="items-end">
        <TextInput
          label="Start Date"
          type="datetime-local"
          value={startDate}
          onChange={(e) => onStartDateChange(e.currentTarget.value)}
          leftSection={<Calendar size="1rem" />}
          classNames={{ input: 'font-mono text-xs' }}
        />
        
        <TextInput
          label="End Date"
          type="datetime-local"
          value={endDate}
          onChange={(e) => onEndDateChange(e.currentTarget.value)}
          leftSection={<Calendar size="1rem" />}
          classNames={{ input: 'font-mono text-xs' }}
        />

        <Select
          label="Page Size"
          value={limit.toString()}
          onChange={(val) => onLimitChange(val || "20")}
          leftSection={<ListFilter size="1rem" />}
          data={[
            { value: "10", label: "10 records" },
            { value: "20", label: "20 records" },
            { value: "50", label: "50 records" },
            { value: "100", label: "100 records" }
          ]}
          classNames={{ input: 'font-mono text-xs' }}
        />

        <Group gap="xs" grow>
          <Button 
            onClick={onReset} 
            variant="default" 
            color="red"
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            Reset
          </Button>
          <Button 
            className="font-bold uppercase text-[10px] tracking-widest"
          >
            <Filter className="h-3.5 w-3.5 mr-2" />
            Apply Filters
          </Button>
        </Group>
      </SimpleGrid>
    </div>
  );
}

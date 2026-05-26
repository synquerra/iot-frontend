import { Button, Group, Text } from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TelemetryPaginationProps {
  skip: number;
  dataLength: number;
  limit: number;
  isLoading: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function TelemetryPagination({
  skip,
  dataLength,
  limit,
  isLoading,
  onNext,
  onPrev
}: TelemetryPaginationProps) {
  return (
    <Group justify="space-between" className="bg-card/30 p-4 rounded-xl border border-primary/5">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" className="tracking-widest">
        Showing entries {skip + 1} to {skip + dataLength}
      </Text>
      <Group gap="xs">
        <Button 
          variant="default" 
          size="sm" 
          onClick={onPrev} 
          disabled={skip === 0 || isLoading}
          leftSection={<ChevronLeft size="1rem" />}
          className="text-[10px] font-bold uppercase tracking-widest"
        >
          Prev
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onNext} 
          disabled={dataLength < limit || isLoading}
          rightSection={<ChevronRight size="1rem" />}
          className="text-[10px] font-bold uppercase tracking-widest"
        >
          Next
        </Button>
      </Group>
    </Group>
  );
}

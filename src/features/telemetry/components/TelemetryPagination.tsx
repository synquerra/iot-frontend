import { Button } from "@/components/ui/button";
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
    <div className="flex items-center justify-between bg-card/30 p-4 rounded-xl border border-primary/5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Showing entries {skip + 1} to {skip + dataLength}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrev} 
          disabled={skip === 0 || isLoading}
          className="h-9 px-4 border-primary/10 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNext} 
          disabled={dataLength < limit || isLoading}
          className="h-9 px-4 border-primary/10 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

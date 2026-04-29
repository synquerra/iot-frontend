import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Filter, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-primary/10 shadow-lg">
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Start Date
        </Label>
        <Input 
          type="datetime-local" 
          value={startDate} 
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-10 border-primary/10 bg-background/50 focus:border-primary/30 transition-all text-xs font-mono"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          End Date
        </Label>
        <Input 
          type="datetime-local" 
          value={endDate} 
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-10 border-primary/10 bg-background/50 focus:border-primary/30 transition-all text-xs font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ListFilter className="h-3 w-3" />
          Page Size
        </Label>
        <Select value={limit.toString()} onValueChange={onLimitChange}>
          <SelectTrigger className="h-10 border-primary/10 bg-background/50 text-xs font-mono">
            <SelectValue placeholder="Select limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 records</SelectItem>
            <SelectItem value="20">20 records</SelectItem>
            <SelectItem value="50">50 records</SelectItem>
            <SelectItem value="100">100 records</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 h-10">
        <Button 
          onClick={onReset} 
          variant="ghost" 
          className="flex-1 h-full text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
        >
          Reset
        </Button>
        <Button 
          className="flex-1 h-full bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
        >
          <Filter className="h-3.5 w-3.5 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

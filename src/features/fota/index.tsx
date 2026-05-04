import { useEffect, useState } from "react";
import { 
  Cpu, 
  Download, 
  History, 
  Info, 
  RefreshCw, 
  Package,
  Calendar,
  FileCode,
  Plus,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listFotaUpdates } from "./services/fotaService";
import type { FotaUpdate } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FotaFormDialog } from "./components/FotaFormDialog";

export default function FotaPage() {
  const [updates, setUpdates] = useState<FotaUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<FotaUpdate | null>(null);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase">FOTA Registry</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Operational firmware lifecycle management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchUpdates} 
            disabled={isLoading}
            variant="outline"
            className="font-bold gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              setEditingUpdate(null);
              setIsFormOpen(true);
            }}
            className="font-bold gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Firmware
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main List */}
        <Card className="lg:col-span-8 shadow-sm">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/5">
            <CardTitle className="text-sm font-bold uppercase tracking-tight">
              Firmware Registry
            </CardTitle>
            <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Available updates and historical versions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : updates.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Version</TableHead>
                      <TableHead className="font-bold">Version Code</TableHead>
                      <TableHead className="font-bold">Size</TableHead>
                      <TableHead className="font-bold">Released</TableHead>
                      <TableHead className="text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updates.map((update) => (
                      <TableRow key={update.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono">{update.version_name}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{update.version_code}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatFileSize(update.file_size)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{update.created_at.split(' ')[0]}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingUpdate(update);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={update.file_url} target="_blank" rel="noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                 <History className="h-12 w-12 text-muted-foreground/20 mb-4" />
                 <h3 className="font-bold text-lg">No Firmware Found</h3>
                 <p className="text-sm text-muted-foreground max-w-[200px]">The FOTA update registry is currently empty.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="py-3 px-4 border-b border-border bg-muted/5">
              <CardTitle className="text-sm font-bold uppercase tracking-tight">
                Latest Release Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-white font-black">{updates[0].version_name}</Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {updates[0].created_at}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-primary/10 shadow-inner">
                    <p className="text-sm leading-relaxed font-medium italic">
                      "{updates[0].release_notes}"
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FotaFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchUpdates}
        editData={editingUpdate}
      />
    </div>
  );
}

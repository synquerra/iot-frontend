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
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="FOTA Updates"
        description="Available firmware updates and historical versions"
        icon={Package}
      >
        <div className="flex items-center gap-2">
            {/* Version Search */}
            <div className="relative group hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search versions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 text-xs font-bold bg-muted/20 border border-border/50 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all rounded-xl outline-none"
              />
            </div>

            <Button 
              onClick={fetchUpdates} 
              disabled={isLoading}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
            </Button>
            
            <Button 
              onClick={() => {
                setEditingUpdate(null);
                setIsFormOpen(true);
              }}
              className="gap-2 rounded-xl h-10 px-3 sm:px-4 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Firmware</span>
            </Button>
        </div>
      </PageHeader>

      {/* Latest Release Banner */}
      {updates.length > 0 && (
        <Card className="shadow-sm border-primary/20 bg-primary/5 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-4 py-3 px-4 bg-muted/5 border-b border-border">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-bold uppercase tracking-tight whitespace-nowrap">
                Latest Release Note
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
              <Badge className="bg-primary text-white font-black hover:bg-primary shadow-sm">{updates[0].version_name}</Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {updates[0].created_at}
              </span>
            </div>
          </div>
          <CardContent className="py-4">
            <p className="text-sm leading-relaxed font-medium italic text-foreground/80">
              "{updates[0].release_notes}"
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-tight text-foreground">
              Firmware Registry
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Available updates and historical versions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredUpdates.length > 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border/50 hover:bg-muted/50">
                  <TableHead className="font-bold whitespace-nowrap h-10">Version</TableHead>
                  <TableHead className="font-bold whitespace-nowrap h-10">Build Code</TableHead>
                  <TableHead className="font-bold whitespace-nowrap hidden sm:table-cell h-10">Size</TableHead>
                  <TableHead className="font-bold whitespace-nowrap hidden md:table-cell h-10">Released</TableHead>
                  <TableHead className="text-right font-bold h-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUpdates.map((update) => (
                  <TableRow key={update.id} className="hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px] h-5">{update.version_name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground py-3">{update.version_code}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground hidden sm:table-cell py-3">{formatFileSize(update.file_size)}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground hidden md:table-cell py-3">{update.created_at.split(' ')[0]}</TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingUpdate(update);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild>
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
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
             <History className="h-12 w-12 text-muted-foreground/20 mb-4" />
             <h3 className="font-bold text-lg">No Firmware Found</h3>
             <p className="text-sm text-muted-foreground max-w-[200px]">The FOTA update registry is currently empty.</p>
          </div>
        )}
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

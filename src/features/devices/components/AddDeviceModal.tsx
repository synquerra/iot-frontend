import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import api from "@/lib/axios";
import { useDeviceTable } from "../context/DeviceTableContext";

export function AddDeviceModal({ children }: { children?: React.ReactNode }) {
  const { refresh } = useDeviceTable();
  const [open, setOpen] = useState(false);
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei.trim()) {
      toast.error("Please enter a valid IMEI string");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/device/add", { imei });
      
      if (data?.status === "success" || data?.message) {
        // Axios interceptor will likely handle the toast if "note" is present,
        // but it's safe to manually toast success just in case.
        if (!data.note) {
          toast.success(data.message || "Device registered successfully!");
        }
        
        // Refresh the backend table to reflect new device
        await refresh();
        
        setOpen(false);
        setImei("");
      } else {
        throw new Error(data?.message || "Registration failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Enter the unique IMEI code to register a new unit to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-8">
            <div className="grid gap-2">
              <Label htmlFor="imei" className="font-semibold text-secondary-foreground">
                IMEI Number
              </Label>
              <Input
                id="imei"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="e.g. 862942074957887"
                disabled={loading}
                autoFocus
                required
                className="col-span-3 transition-colors hover:border-ring focus:border-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

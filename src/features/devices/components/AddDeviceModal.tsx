import { useState } from "react";
import { Button, Modal, TextInput, Group, Box, Text } from "@mantine/core";
import { toast } from "@/lib/toast";
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
        if (!data.note) {
          toast.success(data.message || "Device registered successfully!");
        }
        
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
    <>
      <Box onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {children || (
          <Button leftSection={<Plus size="1rem" />}>
            Add Device
          </Button>
        )}
      </Box>

      <Modal 
        opened={open} 
        onClose={() => setOpen(false)} 
        title={<Text fw={700}>Add New Device</Text>}
        centered
        size="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form onSubmit={handleSubmit}>
          <Box className="pb-6 pt-2">
            <Text size="sm" c="dimmed" mb="lg">
              Enter the unique IMEI code to register a new unit to the platform.
            </Text>
            
            <TextInput
              label={
                <Text component="span" fw={600} size="sm">
                  IMEI Number <Text component="span" c="red">*</Text>
                </Text>
              }
              value={imei}
              onChange={(e) => setImei(e.currentTarget.value)}
              placeholder="e.g. 862942074957887"
              disabled={loading}
              autoFocus
              required
              data-autofocus
            />
          </Box>
          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              variant="default"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {loading ? "Registering..." : "Add Device"}
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}

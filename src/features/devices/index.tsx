import { DeviceGrid } from "./components/DeviceGrid";
import { DeviceToolbar } from "./components/DeviceToolbar";
import { DeviceTableProvider } from "./context/DeviceTableContext";
import { useDevices } from "./hooks/useDevices";
import DeviceStatusGrid from "./components/DeviceStatus";

import { PageHeader } from "@/components/PageHeader";
import { PhoneIcon } from "lucide-react";

export default function DevicesPage() {
  const { devices, loading, refresh } = useDevices();

  return (
    <DeviceTableProvider devices={devices} loading={loading} refresh={refresh}>
      <div className="space-y-6">
        <PageHeader
          title="Device Registry"
          description="Manage and monitor all connected IoT units"
          icon={PhoneIcon}
        />
        <DeviceToolbar />
        <DeviceStatusGrid />
        <DeviceGrid />
      </div>
    </DeviceTableProvider>
  );
}

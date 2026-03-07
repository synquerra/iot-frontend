import { DeviceGrid } from "./components/DeviceGrid";
import { DeviceToolbar } from "./components/DeviceToolbar";
import { DeviceTableProvider } from "./context/DeviceTableContext";
import { useDevices } from "./hooks/useDevices";

export default function DevicesPage() {
  const { devices, loading, refresh } = useDevices();

  return (
    <DeviceTableProvider devices={devices} loading={loading} refresh={refresh}>
      <div className="space-y-6">
        <DeviceToolbar />
        <DeviceGrid />
      </div>
    </DeviceTableProvider>
  );
}

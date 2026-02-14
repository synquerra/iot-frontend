import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function QueryDeviceSettings() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="QUERY_DEVICE_SETTINGS"
        title="Query Device Settings"
        description="Request current device configuration settings"
        badgeColor="blue"
        headerColor="blue"
        icon="fa-cog"
        infoText="This command queries the device for its current configuration settings including intervals, limits, and operational parameters. The device will respond with all configured settings."
        buttonText="Query Settings"
        buttonIcon="fa-search"
        successMessage="Device settings query sent successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="QUERY_DEVICE_SETTINGS" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

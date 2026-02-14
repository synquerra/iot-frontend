import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function AirplaneEnable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="AIRPLANE_ENABLE"
        title="Enable Airplane Mode"
        description="Enable airplane mode on the device"
        badgeColor="blue"
        headerColor="blue"
        icon="fa-plane"
        infoText="This command enables airplane mode on the device, disabling all wireless communications including cellular, Wi-Fi, and Bluetooth."
        buttonText="Enable Airplane Mode"
        buttonIcon="fa-check-circle"
        successMessage="Airplane mode enabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="AIRPLANE_ENABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

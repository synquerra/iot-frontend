import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function AmbientEnable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="AMBIENT_ENABLE"
        title="Enable Ambient Mode"
        description="Enable ambient listening mode on the device"
        badgeColor="purple"
        headerColor="purple"
        icon="fa-microphone"
        infoText="This command enables ambient mode on the device, allowing it to listen to surrounding audio. This feature can be used for monitoring purposes."
        buttonText="Enable Ambient Mode"
        buttonIcon="fa-check-circle"
        successMessage="Ambient mode enabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="AMBIENT_ENABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

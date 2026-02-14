import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function AmbientDisable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="AMBIENT_DISABLE"
        title="Disable Ambient Mode"
        description="Disable ambient listening mode on the device"
        badgeColor="red"
        headerColor="red"
        icon="fa-microphone-slash"
        infoText="This command disables ambient mode on the device, stopping it from listening to surrounding audio."
        buttonText="Disable Ambient Mode"
        buttonIcon="fa-ban"
        successMessage="Ambient mode disabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="AMBIENT_DISABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

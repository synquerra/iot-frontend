import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function AmbientStop() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="AMBIENT_STOP"
        title="Stop Ambient Mode"
        description="Stop ambient listening session on the device"
        badgeColor="orange"
        headerColor="orange"
        icon="fa-stop-circle"
        infoText="This command stops the current ambient listening session on the device. Use this to end an active ambient monitoring session."
        buttonText="Stop Ambient Mode"
        buttonIcon="fa-stop"
        successMessage="Ambient mode stopped successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="AMBIENT_STOP" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

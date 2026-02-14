import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function GPSDisable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="GPS_DISABLE"
        title="Disable GPS"
        description="Disable GPS functionality on the device"
        badgeColor="red"
        headerColor="red"
        icon="fa-map-marker-alt"
        infoText="This command disables GPS functionality on the device. Location tracking will be stopped and the device will not report its position."
        buttonText="Disable GPS"
        buttonIcon="fa-ban"
        successMessage="GPS disabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="GPS_DISABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function CallEnable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="CALL_ENABLE"
        title="Enable Call"
        description="Enable calling functionality on the device"
        badgeColor="green"
        headerColor="green"
        icon="fa-phone"
        infoText="This command enables the calling functionality on the device. Once enabled, the device will be able to make and receive calls."
        buttonText="Enable Call"
        buttonIcon="fa-check-circle"
        successMessage="Call functionality enabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="CALL_ENABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function CallDisable() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="CALL_DISABLE"
        title="Disable Call"
        description="Disable calling functionality on the device"
        badgeColor="red"
        headerColor="red"
        icon="fa-phone-slash"
        infoText="This command disables the calling functionality on the device. Once disabled, the device will not be able to make or receive calls."
        buttonText="Disable Call"
        buttonIcon="fa-ban"
        successMessage="Call functionality disabled successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="CALL_DISABLE" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

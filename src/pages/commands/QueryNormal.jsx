import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function QueryNormal() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="QUERY_NORMAL"
        title="Query Normal Status"
        description="Request current normal operation status from the device"
        badgeColor="blue"
        headerColor="blue"
        icon="fa-question-circle"
        infoText="This command queries the device for its current normal operation status. The device will respond with information about its current state, battery level, GPS status, and other operational parameters."
        buttonText="Query Status"
        buttonIcon="fa-search"
        successMessage="Normal status query sent successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="QUERY_NORMAL" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

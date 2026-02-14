import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function LEDOff() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="LED_OFF"
        title="Turn LED Off"
        description="Turn off the device LED indicator"
        badgeColor="red"
        headerColor="red"
        icon="fa-lightbulb"
        infoText="This command turns off the LED indicator on the device. The LED will remain off until manually turned on."
        buttonText="Turn LED Off"
        buttonIcon="fa-power-off"
        successMessage="LED turned off successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="LED_OFF" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

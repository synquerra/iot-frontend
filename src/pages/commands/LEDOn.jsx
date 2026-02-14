import React from "react";
import SimpleCommandPage from "./SimpleCommandPage";
import CommandHistory from "../../components/CommandHistory";

export default function LEDOn() {
  const [imei, setImei] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCommandSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SimpleCommandPage
        commandType="LED_ON"
        title="Turn LED On"
        description="Turn on the device LED indicator"
        badgeColor="green"
        headerColor="green"
        icon="fa-lightbulb"
        infoText="This command turns on the LED indicator on the device. The LED will remain on until manually turned off."
        buttonText="Turn LED On"
        buttonIcon="fa-power-off"
        successMessage="LED turned on successfully"
        onImeiChange={setImei}
        onCommandSuccess={handleCommandSuccess}
      />
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="LED_ON" triggerRefresh={refreshTrigger} />
      </div>
    </>
  );
}

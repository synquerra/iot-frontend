import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMMANDS,
  type GeofencePayloadCoordinate,
  type PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";
import {
  getDeviceCommandToastContent,
  sendDeviceCommand,
} from "@/helpers/deviceCommandHelper";
import { AlertTriangle, Loader2, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SafetySettingsProps = {
  selectedImei: string;
};

type GeofenceFormState = {
  geofence_number: string;
  geofence_id: string;
  coordinates: string;
};

const DEFAULT_GEOFENCE: GeofenceFormState = {
  geofence_number: "GEO1",
  geofence_id: "",
  coordinates: "",
};

const GEOFENCE_NUMBERS = ["GEO1", "GEO2", "GEO3", "GEO4", "GEO5"];

function parseCoordinates(input: string) {
  const parsed = JSON.parse(input) as GeofencePayloadCoordinate[];

  if (!Array.isArray(parsed)) {
    throw new Error("Coordinates must be a JSON array.");
  }

  return parsed;
}

export function SafetySettings({ selectedImei }: SafetySettingsProps) {
  const [geofence, setGeofence] = useState<GeofenceFormState>(DEFAULT_GEOFENCE);
  const [isSavingGeofence, setIsSavingGeofence] = useState(false);
  const [isStoppingSos, setIsStoppingSos] = useState(false);

  const runCommand = async (command: string, params: Record<string, unknown> = {}) => {
    if (!selectedImei) {
      toast.error("Select a device before sending a command.");
      return null;
    }

    const response = await sendDeviceCommand<PublishedDeviceCommandResult>(
      selectedImei,
      command,
      params,
    );

    const toastContent = getDeviceCommandToastContent(response);
    toast.success(toastContent.title, {
      description: toastContent.description,
    });

    return response;
  };

  const handleSaveGeofence = async () => {
    try {
      setIsSavingGeofence(true);
      const coordinates = parseCoordinates(geofence.coordinates);

      await runCommand(COMMANDS.SET_GEOFENCE, {
        geofence_number: geofence.geofence_number,
        geofence_id: geofence.geofence_id,
        coordinates,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update geofence.";
      toast.error(message);
    } finally {
      setIsSavingGeofence(false);
    }
  };

  const handleStopSos = async () => {
    try {
      setIsStoppingSos(true);
      await runCommand(COMMANDS.STOP_SOS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to stop SOS.";
      toast.error(message);
    } finally {
      setIsStoppingSos(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Geofence Settings
          </CardTitle>
          <CardDescription>
            Configure the `SET_GEOFENCE` command payload for the selected device
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="geofence-number">Geofence Number</Label>
              <Select
                value={geofence.geofence_number}
                onValueChange={(value) =>
                  setGeofence((current) => ({
                    ...current,
                    geofence_number: value,
                  }))
                }
              >
                <SelectTrigger id="geofence-number">
                  <SelectValue placeholder="Select geofence number" />
                </SelectTrigger>
                <SelectContent>
                  {GEOFENCE_NUMBERS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geofence-id">Geofence ID</Label>
              <Input
                id="geofence-id"
                placeholder="Office"
                value={geofence.geofence_id}
                onChange={(event) =>
                  setGeofence((current) => ({
                    ...current,
                    geofence_id: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geofence-coordinates">Coordinates JSON</Label>
            <textarea
              id="geofence-coordinates"
              className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder='[{"lat":23.355061164122585,"lng":85.3585982322693},{"lat":23.355711247869795,"lng":85.35979986190797},{"lat":23.355273302558516,"lng":85.36043921989888}]'
              value={geofence.coordinates}
              onChange={(event) =>
                setGeofence((current) => ({
                  ...current,
                  coordinates: event.target.value,
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Provide 3 to 5 points in the same `lat` and `lng` structure used by
              the command API.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={handleSaveGeofence}
              disabled={isSavingGeofence}
            >
              {isSavingGeofence ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
              {isSavingGeofence ? "Saving..." : "Save Geofence"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Emergency Controls
          </CardTitle>
          <CardDescription>
            Send emergency device actions immediately
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">Stop SOS</p>
            <p className="text-sm text-muted-foreground">
              Sends the `STOP_SOS` command with an empty params object
            </p>
          </div>

          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleStopSos}
            disabled={isStoppingSos}
          >
            {isStoppingSos ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle size={16} />
            )}
            {isStoppingSos ? "Stopping..." : "Stop SOS"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

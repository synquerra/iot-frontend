import type { LatLngTuple } from "leaflet";
import { useMapEvents } from "react-leaflet";

type MapClickHandlerProps = {
  disabled: boolean;
  onAddPoint: (point: LatLngTuple) => void;
};

export function MapClickHandler({
  disabled,
  onAddPoint,
}: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      if (disabled) {
        return;
      }

      onAddPoint([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

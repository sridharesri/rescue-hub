import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Disaster, Hospital, Shelter } from "@/types/records";
import { SEVERITY_HEX } from "@/lib/format";

export type MapLayers = {
  disasters: boolean;
  shelters: boolean;
  hospitals: boolean;
};

type Props = {
  disasters: Disaster[];
  shelters: Shelter[];
  hospitals: Hospital[];
  layers: MapLayers;
};

export default function DisasterMap({ disasters, shelters, hospitals, layers }: Props) {
  const center: [number, number] = disasters[0]
    ? [disasters[0].latitude, disasters[0].longitude]
    : [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom
      className="h-[70vh] min-h-[420px] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {layers.disasters &&
        disasters.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={10}
            pathOptions={{
              color: SEVERITY_HEX[item.severity],
              fillColor: SEVERITY_HEX[item.severity],
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{item.title}</strong>
              <br />
              {item.severity} · {item.status}
              <br />
              {item.area}
            </Popup>
          </CircleMarker>
        ))}

      {layers.shelters &&
        shelters.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={7}
            pathOptions={{ color: "#2e7d5b", fillColor: "#2e7d5b", fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <strong>{item.name}</strong>
              <br />
              {Math.max(0, item.capacity - item.occupancy)} places free
            </Popup>
          </CircleMarker>
        ))}

      {layers.hospitals &&
        hospitals.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={7}
            pathOptions={{ color: "#2f6fb5", fillColor: "#2f6fb5", fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <strong>{item.name}</strong>
              <br />
              {item.available_beds} beds available
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

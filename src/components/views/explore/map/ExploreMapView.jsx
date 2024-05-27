import { Geolocation } from "@capacitor/geolocation";
import { MapContainer, TileLayer } from "react-leaflet";

export default function ExploreMapView() {
  const printCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    console.log("Current position:", coordinates);
  };

  return (
    <div>
      <button onClick={printCurrentPosition}>Get Coordinates</button>
      <MapContainer>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

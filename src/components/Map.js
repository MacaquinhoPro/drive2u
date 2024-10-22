import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const position = [51.505, -0.09]; // Coordenadas iniciales

  return (
    <MapContainer center={position} zoom={13} className="h-96 w-full">
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Aquí estás.</Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;

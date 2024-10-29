import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NantesMap = () => {
    const center = [47.2184, -1.5536]; // Latitude et longitude de Nantes
    const zoomLevel = 13;

    return (
        <MapContainer center={center} zoom={zoomLevel} style={{ height: "500px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    );
};

export default NantesMap;

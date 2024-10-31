import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
});

const NantesMap = () => {
    const center = [47.2184, -1.5536]; // Latitude et longitude de Nantes
    const zoomLevel = 13;
    const [stops, setStops] = useState([]);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        // Charger stops.json
        fetch('/stops.json')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setStops(data))
            .catch((error) => console.error("Erreur de chargement des données : ", error));

        // Charger trips.json
        fetch('/trips.json')
            .then((response) => response.json())
            .then((data) => setTrips(data));
    }, []);

    return (
        <MapContainer center={center} zoom={zoomLevel} className='w-full h-auto'>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {stops.map((stops, index) => (
                <Marker key={index} position={[stops.stop_lat, stops.stop_lon]} icon={icon}>
                    <Popup>{stops.stop_name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default NantesMap;

import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
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
    const [shapes, setShapes] = useState([]);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        // Charger stops.json
        fetch('/stops.json')
            .then((response) => response.json())
            .then((data) => setStops(data))
            .catch((error) => console.error("Erreur de chargement des données des arrêts: ", error));

        // Charger trips.json
        fetch('/trips.json')
            .then((response) => response.json())
            .then((data) => setTrips(data))
            .catch((error) => console.error("Erreur de chargement des données des trajets: ", error));

        fetch('/shapes.json')
            .then((response) => response.json())
            .then((data) => setShapes(data))
            .catch((error) => console.error("Erreur de chargement des données de shape : ", error));

        // Charger routes.json
        fetch('/routes.json')
            .then((response) => response.json())
            .then((data) => setRoutes(data))
            .catch((error) => console.error("Erreur de chargement des données de route : ", error));
    }, []);

    // Associer chaque route_id à sa couleur depuis routes.json
    const routeColors = routes.reduce((acc, route) => {
        acc[route.route_id] = `#${route.route_color}`;
        return acc;
    }, {});

    // Associer chaque shape_id à une couleur via trips.json
    const shapeColors = trips.reduce((acc, trip) => {
        const color = routeColors[trip.route_id] || '#000000'; // couleur associée ou noir par défaut
        acc[trip.shape_id] = color;
        return acc;
    }, {});

    // Groupement des shapes par shape_id
    const groupedShapes = shapes.reduce((acc, shape) => {
        const { shape_id, shape_pt_lat, shape_pt_lon } = shape;
        if (!acc[shape_id]) acc[shape_id] = [];
        acc[shape_id].push([shape_pt_lat, shape_pt_lon]);
        return acc;
    }, {});


    return (
        <MapContainer center={center} zoom={zoomLevel} className='w-full h-auto'>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {stops.map((stop, index) => (
                <Marker key={index} position={[stop.stop_lat, stop.stop_lon]} icon={icon}>
                    <Popup>{stop.stop_name}</Popup>
                </Marker>
            ))}

            {Object.entries(groupedShapes).map(([shapeId, coordinates]) => {
                // Récupérer la couleur associée au shape_id via shapeColors
                const color = shapeColors[shapeId] || '#000000';

                return (
                    <Polyline
                        key={shapeId}
                        positions={coordinates}
                        pathOptions={{ color }}
                    />
                );
            })}
        </MapContainer>
    );
};

export default NantesMap;

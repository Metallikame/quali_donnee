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
    const [stopRoutes, setStopRoutes] = useState({});
    const [filter, setFilter] = useState(''); // État pour le filtre

    useEffect(() => {
        // Charger les fichiers JSON
        Promise.all([
            fetch('/stops.json').then((res) => res.json()),
            fetch('/trips.json').then((res) => res.json()),
            fetch('/shapes.json').then((res) => res.json()),
            fetch('/routes.json').then((res) => res.json()),
        ])
            .then(([stopsData, tripsData, shapesData, routesData]) => {
                setStops(stopsData);
                setTrips(tripsData);
                setShapes(shapesData);
                setRoutes(routesData);

                // Construire la relation route_id → route_short_name
                const routeIdToShortName = routesData.reduce((acc, route) => {
                    acc[route.route_id] = route.route_short_name;
                    return acc;
                }, {});

                // Construire la relation stop_id → shape_id
                const stopToShapes = shapesData.reduce((acc, shape) => {
                    if (!acc[shape.stop_id]) {
                        acc[shape.stop_id] = new Set();
                    }
                    acc[shape.stop_id].add(shape.shape_id);
                    return acc;
                }, {});

                // Construire la relation shape_id → route_id
                const shapeToRoutes = tripsData.reduce((acc, trip) => {
                    acc[trip.shape_id] = trip.route_id;
                    return acc;
                }, {});

                // Construire la relation stop_id → route_short_name[]
                const stopToRouteShortNames = Object.entries(stopToShapes).reduce((acc, [stop_id, shapeIds]) => {
                    const routeShortNames = new Set();
                    shapeIds.forEach((shape_id) => {
                        const routeId = shapeToRoutes[shape_id];
                        if (routeId) {
                            const shortName = routeIdToShortName[routeId];
                            if (shortName) {
                                routeShortNames.add(shortName);
                            }
                        }
                    });
                    acc[stop_id] = Array.from(routeShortNames);
                    return acc;
                }, {});

                setStopRoutes(stopToRouteShortNames);
            })
            .catch((error) => console.error('Erreur lors du chargement des fichiers JSON :', error));
    }, []);

    // Associer chaque route_id à sa couleur depuis routes.json
    const routeColors = routes.reduce((acc, route) => {
        acc[route.route_id] = `#${route.route_color}`;
        return acc;
    }, {});

    // Associer chaque shape_id à sa couleur via trips.json
    const shapeColors = trips.reduce((acc, trip) => {
        const color = routeColors[trip.route_id] || '#000000'; // Noir par défaut
        acc[trip.shape_id] = color;
        return acc;
    }, {});

    // Groupement des shapes par shape_id avec coordonnées des stops
    const groupedShapes = shapes.reduce((acc, shape) => {
        const { shape_id, shape_pt_sequence, stop_id } = shape;
        if (!acc[shape_id]) {
            acc[shape_id] = [];
        }
        // Associer les coordonnées de stop_id depuis stops.json
        const stop = stops.find((s) => s.stop_id === stop_id);
        if (stop) {
            acc[shape_id].push({
                lat: stop.stop_lat,
                lon: stop.stop_lon,
                sequence: shape_pt_sequence,
                stop_name: stop.stop_name,
                stop_id: stop_id,
            });
        }
        return acc;
    }, {});

    // Fonction pour gérer les changements du filtre
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Filtrer les arrêts en fonction du filtre (par nom)
    const filteredStops = stops.filter((stop) =>
        stop.stop_name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <>
            {/* Champ de Recherche */}
            <div className="filter-container">
                <label htmlFor="filter">Filtrer par nom d'arrêt :</label>
                <input
                    id="filter"
                    type="text"
                    value={filter}
                    onChange={handleFilterChange}
                    placeholder="Rechercher un arrêt"
                />
            </div>
            <MapContainer center={center} zoom={zoomLevel} className="w-full h-auto">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filteredStops.map((stop) => (
                    <Marker
                        key={stop.stop_id}
                        position={[stop.stop_lat, stop.stop_lon]}
                        icon={icon}
                    >
                        <Popup>
                            <div>
                                <h3>{stop.stop_name}</h3>
                                <p>
                                    Lignes :{' '}
                                    {stopRoutes[stop.stop_id]
                                        ? stopRoutes[stop.stop_id].join(', ')
                                        : 'Aucune route'}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {Object.entries(groupedShapes).map(([shapeId, points]) => {
                    const color = shapeColors[shapeId] || '#000000'; // Couleur par défaut
                    const sortedPoints = points.sort((a, b) => a.sequence - b.sequence); // Trier par sequence

                    return (
                        <Polyline
                            key={shapeId}
                            positions={sortedPoints.map((p) => [p.lat, p.lon])}
                            pathOptions={{ color }}
                        />
                    );
                })}
            </MapContainer>
        </>
    );
};

export default NantesMap;
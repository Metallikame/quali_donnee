import React, {useEffect, useState} from 'react';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from "axios";

const icon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
});

const NantesMap = () => {
    const center = [47.2184, -1.5536]; // Latitude et longitude de Nantes
    const zoomLevel = 13;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            let allData = [];
            const limit = 100;
            let offset = 0;
            let hasMoreData = true;
            let maxData = null;

            while (hasMoreData) {
                try {
                    const response = await axios.get(
                        `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_tan-arrets/records?limit=${limit}&offset=${offset}`
                    );

                    if (!maxData) {
                        maxData = response.data['total_count'];
                    }

                    const newData = response.data['results'].map(record => record);
                    allData = [...allData, ...newData];

                    offset += limit;
                    if (allData.length >= maxData) hasMoreData = false;

                } catch (error) {
                    console.error('Une erreur s\'est produite', error);
                    hasMoreData = false;
                }
            }

            setData(allData);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <p>Chargement...</p>;

    return (
        <MapContainer center={center} zoom={zoomLevel} className='w-full h-auto'>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {data.map((point, index) => (
                <Marker key={index} position={[point.stop_coordinates.lat, point.stop_coordinates.lon]} icon={icon}>
                    <Popup>{point.stop_name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default NantesMap;

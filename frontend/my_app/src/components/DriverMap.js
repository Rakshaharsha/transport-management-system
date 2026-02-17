import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/Button';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng]);
    return null;
};

const DriverMap = ({ drivers, onSelectDriver }) => {
    // Default center (e.g., City Center) - can be adjustable
    const defaultCenter = [12.9716, 77.5946];

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {drivers.map((driver) => (
                    driver.current_latitude && driver.current_longitude && (
                        <Marker
                            key={driver.id}
                            position={[driver.current_latitude, driver.current_longitude]}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{driver.username}</h3>
                                    <p className="text-sm">{driver.name}</p>
                                    <p className="text-xs text-gray-500">Status: {driver.status}</p>
                                    <div className="mt-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onSelectDriver(driver)}
                                            className="w-full"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default DriverMap;

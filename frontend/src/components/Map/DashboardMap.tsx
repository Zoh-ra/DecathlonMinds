'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import styles from './DashboardMap.module.css';

interface DashboardMapProps {
  routePoints: [number, number][];
  markerPoints: {
    position: [number, number];
    name: string;
  }[];
}

const DashboardMap: React.FC<DashboardMapProps> = ({ routePoints, markerPoints }) => {
  return (
    <MapContainer 
      center={[48.8534, 2.2845]} 
      zoom={14} 
      className={styles.map}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline 
        positions={routePoints} 
        color="#F5603D" 
        weight={4}
      />
      {markerPoints.map((marker, idx) => (
        <Marker
          key={idx}
          position={marker.position}
          icon={new Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DashboardMap;

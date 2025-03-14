'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import styles from './page.module.css';

// Données pour le parcours préféré
const routePoints: [number, number][] = [
  [48.8584, 2.2945],
  [48.8584, 2.2845],
  [48.8534, 2.2845],
  [48.8534, 2.2745],
  [48.8484, 2.2745],
  [48.8484, 2.2845],
  [48.8534, 2.2845],
  [48.8584, 2.2945],
];

const markerPoints: { position: [number, number]; name: string }[] = [
  { position: [48.8584, 2.2945], name: "Départ" },
  { position: [48.8484, 2.2745], name: "Point d'eau" },
  { position: [48.8584, 2.2945], name: "Arrivée" },
];

// Composant Map utilisable uniquement côté client
function DashboardMapContent() {
  // Créer l'icône pour les marqueurs
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

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
      {markerPoints.map((point, index) => (
        <Marker 
          key={index}
          position={point.position}
          icon={customIcon}
        >
          <Popup>{point.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Exporter le composant en utilisant un rendu côté client uniquement
export default DashboardMapContent;

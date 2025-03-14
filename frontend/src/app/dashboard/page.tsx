'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Navbar from '@/components/Navigation/Navbar';

// Données pour le graphique d'activité hebdomadaire
const weekData = [
  { name: 'L', value: 5400 },
  { name: 'M', value: 3200 },
  { name: 'M', value: 6800 },
  { name: 'J', value: 4500 },
  { name: 'V', value: 2000 },
  { name: 'S', value: 7000 },
  { name: 'D', value: 4800 },
  { name: 'L', value: 3000 },
  { name: 'M', value: 6500 },
  { name: 'M', value: 5000 },
  { name: 'J', value: 8000 },
];

// Données pour le sommeil
const sleepData = [
  { value: 85 },
  { value: 75 },
  { value: 90 },
  { value: 65 },
  { value: 80 },
];

// Import dynamique de la carte pour éviter les erreurs côté serveur
const MapWithNoSSR = dynamic(() => import('./DashboardMap'), {
  ssr: false, 
  loading: () => <div className={styles.mapLoading}>Chargement de la carte...</div>
});

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(3); // Index du jour sélectionné (26 mars)
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    
    // Récupérer le nom d'utilisateur du localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Jours de la semaine pour la sélection de dates
  const dates = [
    { day: '23', month: 'mar' },
    { day: '24', month: 'mar' },
    { day: '25', month: 'mar' },
    { day: '26', month: 'mar' },
    { day: '27', month: 'mar' },
  ];

  // Fonction pour déterminer la couleur de la barre en fonction de la valeur
  const getBarColor = (value: number) => {
    const maxValue = 8000;
    const percentage = (value / maxValue) * 100;
    
    if (percentage < 30) return '#FF6B4A'; // Orange pour les valeurs basses
    if (percentage < 50) return '#FF8A65'; // Orange-rouge pour les valeurs moyennes-basses
    if (percentage < 70) return '#5C83DB'; // Bleu moyen pour les valeurs moyennes-hautes
    return '#3E55CC'; // Bleu foncé pour les valeurs hautes
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.dashboardContainer}>
        {/* En-tête avec nom et objectif */}
        <header className={styles.header}>
          <div className={styles.userInfoSection}>
            <h1 className={styles.userNameLarge}>{userName}</h1>
            <h2 className={styles.subtitle}>Objectif hebdomadaire: 10 000 pas par jour</h2>
          </div>
          <div>
            {/* Espace pour des actions ou des notifications */}
          </div>
        </header>

        {/* Sélection de date */}
        <div className={styles.dateSelector}>
          {dates.map((date, index) => (
            <div 
              key={index}
              className={`${styles.dateCard} ${selectedDate === index ? styles.selectedDate : ''}`}
              onClick={() => setSelectedDate(index)}
            >
              <span className={styles.day}>{date.day}</span>
              <span className={styles.month}>{date.month}</span>
            </div>
          ))}
        </div>

        {/* Contenu principal du dashboard */}
        <div className={styles.mapCard}>
          <h3 className={styles.cardTitle}>Carte de mes parcours</h3>
          <div className={styles.mapContainer}>
            {isMounted && <MapWithNoSSR />}
          </div>
        </div>

        {/* Aperçu d'activité */}
        <div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Activité récente</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData.slice(-7)} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {weekData.slice(-7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.activityStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>8.5</span>
              <span className={styles.statLabel}>km</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>72</span>
              <span className={styles.statLabel}>min</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>9.2k</span>
              <span className={styles.statLabel}>pas</span>
            </div>
          </div>
        </div>

        {/* Statistiques de sommeil */}
        <div className={styles.sleepCard}>
          <h3 className={styles.cardTitle}>Qualité du sommeil</h3>
          <div className={styles.sleepBarContainer}>
            <div className={styles.sleepBarLabel}>
              <span>Mauvais</span>
              <span>Excellent</span>
            </div>
            <div className={styles.sleepBars}>
              {sleepData.map((item, index) => (
                <div key={index} className={styles.sleepBarWrapper}>
                  <div 
                    className={styles.sleepBar} 
                    style={{ height: `${item.value}%` }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.sleepDays}>
              <span>L</span>
              <span>M</span>
              <span>M</span>
              <span>J</span>
              <span>V</span>
            </div>
          </div>
          <div className={styles.sleepStats}>
            <div className={styles.sleepStatRow}>
              <span className={styles.sleepStatLabel}>Moyenne</span>
              <span className={styles.sleepStatValue}>7.5h</span>
            </div>
            <div className={styles.sleepStatRow}>
              <span className={styles.sleepStatLabel}>Meilleur nuit</span>
              <span className={styles.sleepStatValue}>8.2h</span>
            </div>
          </div>
        </div>

        {/* Derniers parcours */}
        <div className={styles.recommendedRoutesCard}>
          <h3 className={styles.cardTitle}>Derniers parcours</h3>
          <div className={styles.routesList}>
            <div className={styles.routeItem}>
              <div className={styles.routeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.19V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V7.81" stroke="#4F6AF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 7L12 14L17 10.5" stroke="#4F6AF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.routeInfo}>
                <h4 className={styles.routeName}>Parc des Buttes Chaumont</h4>
                <p className={styles.routeDetails}>5.2km • 45min • Modéré</p>
              </div>
            </div>
            <div className={styles.routeItem}>
              <div className={styles.routeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 19H9C6.79086 19 5 17.2091 5 15V7" stroke="#4F6AF4" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="5" cy="5" r="2" stroke="#4F6AF4" strokeWidth="2"/>
                  <circle cx="19" cy="5" r="2" stroke="#4F6AF4" strokeWidth="2"/>
                  <circle cx="19" cy="19" r="2" stroke="#4F6AF4" strokeWidth="2"/>
                </svg>
              </div>
              <div className={styles.routeInfo}>
                <h4 className={styles.routeName}>Bois de Vincennes</h4>
                <p className={styles.routeDetails}>8.7km •
1h15min • Difficile</p>
              </div>
            </div>
            <div className={styles.routeItem}>
              <div className={styles.routeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4F6AF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="#4F6AF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.routeInfo}>
                <h4 className={styles.routeName}>Canal Saint-Martin</h4>
                <p className={styles.routeDetails}>3.8km • 30min • Facile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}

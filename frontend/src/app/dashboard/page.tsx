'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Navbar from '@/components/Navigation/Navbar';
import Image from 'next/image';
import ProfileAvatar from '@/components/ProfileAvatar/ProfileAvatar';

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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.dashboardContainer}>
        {/* En-tête avec nom et objectif */}
        <header className={styles.header}>
          <div className={styles.userInfoSection}>
            <Image 
              src="/decathlonminds_logo.svg" 
              alt="DecathlonMind Logo" 
              width={180} 
              height={40}
              className={styles.logo}
              priority
            />
            <div className={styles.userInfo}>
              {userName && (
                <>
                  <span className={styles.userName}>{userName}</span>
                  <ProfileAvatar userName={userName} />
                </>
              )}
            </div>
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

        {/* Section d'aperçu de l'activité */}
        <section className={styles.activityOverviewSection}>
          <h2 className={styles.sectionTitle}>Aperçu de votre activité</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 10 || index === 6 ? '#F5603D' : '#1f2a6a'} 
                      opacity={index === 10 || index === 6 ? 1 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section des cartes d'activité */}
        <section className={styles.activityCardsSection}>
          {/* Carte de marche */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <span className={styles.activityTitle}>Marche</span>
              <span className={styles.activityIcon}>🚶‍♂️</span>
            </div>
            <div className={styles.circleProgressContainer}>
              <div className={styles.circleProgress}>
                <div className={styles.progressValue}>8104</div>
              </div>
            </div>
          </div>

          {/* Carte de sommeil */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <span className={styles.activityTitle}>Sommeil</span>
              <span className={styles.activityIcon}>🌙</span>
            </div>
            <div className={styles.sleepChartContainer}>
              {sleepData.map((entry, index) => (
                <div 
                  key={index} 
                  className={styles.sleepBar}
                  style={{ height: `${entry.value}%` }}
                />
              ))}
            </div>
            <div className={styles.sleepValues}>
              <span>6h30</span>
            </div>
          </div>

          {/* Carte pour la carte du parcours */}
          <div className={styles.activityCard} style={{ gridColumn: '1 / 3' }}>
            <div className={styles.activityHeader}>
              <span className={styles.activityTitle}>Votre parcours préféré</span>
              <span className={styles.activityIcon}>🗺️</span>
            </div>
            <div className={styles.mapContainer}>
              {isMounted && <MapWithNoSSR />}
            </div>
          </div>
        </section>

        {/* Section de résumé des statistiques */}
        <section className={styles.statsSummarySection}>
          <h2 className={styles.statsSectionTitle}>Vos statistiques</h2>
          
          {/* Carte d'eau */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💧</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>3/5</div>
              <div className={styles.statLabel}>Consommation d&apos;eau</div>
            </div>
          </div>

          {/* Carte de fréquence cardiaque */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❤️</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>95 bpm</div>
              <div className={styles.statLabel}>Fréquence cardiaque</div>
            </div>
          </div>

          {/* Carte de calories */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>1845</div>
              <div className={styles.statLabel}>Calories brûlées</div>
            </div>
          </div>

          {/* Carte de distance */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📏</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>5.2 km</div>
              <div className={styles.statLabel}>Distance parcourue</div>
            </div>
          </div>

          {/* Carte de durée */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏱️</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>45 min</div>
              <div className={styles.statLabel}>Temps d&apos;activité</div>
            </div>
          </div>
        </section>
      </div>

      {/* Utilisation du composant Navbar partagé */}
      <Navbar />
    </div>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  // Déterminer l'onglet actif en fonction du chemin actuel
  const getActiveTab = () => {
    if (pathname?.includes('/feed')) return 'aujourd\'hui';
    if (pathname?.includes('/search')) return 'explorer';
    if (pathname?.includes('/dashboard')) return 'dashboard';
    if (pathname?.includes('/profile')) return 'profil';
    if (pathname?.includes('/map')) return 'map';
    return '';
  };

  const activeTab = getActiveTab();

  // Fonction pour gérer la navigation
  const handleTabChange = (tab: string) => {
    // Naviguer vers la page correspondante
    switch(tab) {
      case 'aujourd\'hui':
        router.push('/feed');
        break;
      case 'explorer':
        // Ouvrir l'interface de recherche
        setShowSearchInput(!showSearchInput);
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'map':
        router.push('/map');
        break;
      case 'profil':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <>
      {showSearchInput && (
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Rechercher..." 
            autoFocus
          />
          <button 
            className={styles.closeSearchButton}
            onClick={() => setShowSearchInput(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
      
      <div className={styles.bottomNavbar}>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('aujourd\'hui')}
            className={`${styles.navLink} ${activeTab === 'aujourd\'hui' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Aujourd&apos;hui</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('explorer')}
            className={`${styles.navLink} ${activeTab === 'explorer' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Rechercher</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('dashboard')}
            className={`${styles.navLink} ${activeTab === 'dashboard' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('profil')}
            className={`${styles.navLink} ${activeTab === 'profil' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Profil</span>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.messageBox}>
        <h1 className={styles.title}>Paramètres</h1>
        <p className={styles.description}>
          Cette page est en cours de développement. Nous y ajouterons bientôt 
          des options pour personnaliser votre expérience.
        </p>
        <button 
          className={styles.backButton}
          onClick={handleGoBack}
        >
          Retour
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.messageBox}>
        <h1 className={styles.title}>Page en cours de développement</h1>
        <p className={styles.description}>
          Nous travaillons actuellement sur cette fonctionnalité pour vous offrir 
          une meilleure expérience. Merci de votre patience.
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

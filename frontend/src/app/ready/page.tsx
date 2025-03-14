'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ready.module.css';

export default function ReadyPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/today');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/logo/Logo.png" 
            alt="DecathlonMind Logo" 
            width={220} 
            height={60}
            priority
          />
        </div>

        <h1 className={styles.title}>Être utile par le mouvement</h1>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.checkIcon}>✓</div>
            <p>Exprimez vos ressentis</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIcon}>✓</div>
            <p>Recevez des recommandations de parcours adaptées</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIcon}>✓</div>
            <p>Suivez votre évolution et observez les effets positifs du mouvement sur votre bien être.</p>
          </div>
        </div>

        <button 
          className={styles.startButton}
          onClick={handleStart}
        >
          Commencer
        </button>
      </div>
    </div>
  );
}

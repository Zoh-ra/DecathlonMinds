'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './felicitation.module.css';

export default function FelicitationPage() {
  const router = useRouter();
  
  // Redirection automatique après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/profilobjectif');
    }, 8000); // Redirection après 8 secondes
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/logo/DecathlonMindsLogo.png" 
            alt="DecathlonMind Logo" 
            width={240} 
            height={60}
            priority
          />
        </div>
        
        <div className={styles.confettiAnimation}>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
        </div>
        
        <h1 className={styles.title}>Félicitation,</h1>
        <h2 className={styles.subtitle}>vous êtes membre de DecatMind !</h2>
        
        <p className={styles.description}>
          Votre compte a été créé avec succès. Vous pouvez désormais profiter pleinement 
          de toutes les fonctionnalités pour améliorer votre bien-être émotionnel.
        </p>
        
        <Link href="/profilobjectif" className={styles.continueButton}>
          Continuer
        </Link>
        
        <p className={styles.redirectMessage}>
          Vous serez automatiquement redirigé dans quelques secondes...
        </p>
      </div>
    </div>
  );
}

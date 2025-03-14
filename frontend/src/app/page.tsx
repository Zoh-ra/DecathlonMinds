'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './launch.module.css';

export default function LaunchPage() {
  return (
    <div className={styles.launchContainer}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/logo/Logo.png"
          alt="DecatMind Logo"
          width={300}
          height={100}
          className={styles.logo}
          priority
        />
      </div>
      
      <div className={styles.taglineContainer}>
        <p className={styles.tagline}>
          Être utile aux gens par le mouvement, parce-que nous sommes concernés par la santé mentale.
        </p>
      </div>
      
      <div className={styles.buttonContainer}>
        <Link 
          href="/connexion" 
          className={styles.continueButton}
        >
          Lancez vous !
        </Link>
      </div>
    </div>
  );
}

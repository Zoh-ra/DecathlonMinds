'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './launch.module.css';

export default function LaunchPage() {
  return (
    <div className={styles.launchContainer}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/logo/Logo.png"
          alt="DecatMind Logo"
          width={1200}
          height={600}
          className={styles.logo}
          priority
        />
      </div>
      
      <div className={styles.taglineContainer}>
        <p className={styles.tagline}>
          Être utile aux gens par le mouvement,<br />
          parce-que nous sommes concernés par la santé mentale.
        </p>
      </div>
      
      <div className={styles.buttonContainer}>
        <Link 
          href="/today" 
          className={styles.launchButton}
        >
          Lancez vous !
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './launch.module.css';

export default function LaunchPage() {
  const router = useRouter();

  const handleLaunch = () => {
    router.push('/today');
  };

  return (
    <div className={styles.launchContainer}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/logo/Logo.png"
          alt="DecatMind Logo"
          width={1000}
          height={500}
          className={styles.logo}
          priority
        />
      </div>
      
      <div className={styles.taglineContainer}>
        <p className={styles.tagline}>
          Être utile aux gens par le mouvement,<br />
          parce-que nous sommes concernés<br />
          par la santé mentale.
        </p>
      </div>
      
      <div className={styles.buttonContainer}>
        <button 
          className={styles.launchButton}
          onClick={handleLaunch}
        >
          Lancez vous !
        </button>
      </div>
    </div>
  );
}

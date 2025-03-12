'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Chatbot from '../../components/Chatbot/Chatbot';

export default function TodayPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Décathlon Minds - Today</h1>
        <p className={styles.description}>
          Bienvenue sur votre page quotidienne. Comment vous sentez-vous aujourd&apos;hui ?
        </p>
        <div className={styles.chatbotContainer}>
          <Chatbot />
        </div>
      </div>
    </main>
  );
}

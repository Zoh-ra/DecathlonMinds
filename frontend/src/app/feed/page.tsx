'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import FeedPostCard from '@/components/Feed/FeedPostCard';
import { Post } from '@/types/feed';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('aujourd\'hui');
  
  // Récupérer l'émotion et la cause des paramètres d'URL
  const emotion = searchParams.get('emotion') || undefined;
  const cause = searchParams.get('cause') || undefined;
  
  // Récupérer les posts depuis l'API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construire l'URL avec les paramètres de filtrage
      let url = '/api/feed/posts?';
      
      // Ajouter l'émotion et la cause si présentes
      if (emotion) url += `emotion=${encodeURIComponent(emotion)}&`;
      if (cause) url += `cause=${encodeURIComponent(cause)}&`;
      
      // Récupérer les posts
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des posts: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des posts:', err);
      setError("Impossible de charger les posts. Veuillez réessayer plus tard.");
      // Utiliser des posts par défaut en cas d'erreur
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [emotion, cause]);
  
  // Charger les posts au chargement initial ou quand les paramètres changent
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, emotion, cause]);

  // Fonction pour changer d'onglet activé
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Rendu du composant
  return (
    <main className={styles.main}>
      {/* Header avec logo */}
      <div className={styles.logoContainer}>
        <Image 
          src="/images/logo/LogoBleu.png" 
          alt="Decathlon Minds" 
          width={160} 
          height={40} 
          priority
        />
        <div className={styles.userProfile}>
          <span className={styles.userName}>Zohra</span>
          <div className={styles.avatarCircle}>
            <span>Z</span>
          </div>
        </div>
      </div>
      
      <div className={styles.container}>
        {/* Affichage des posts */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement de votre contenu personnalisé...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchPosts} className={styles.retryButton}>
              Réessayer
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>Aucun post disponible pour le moment.</p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {/* Barre de navigation en bas */}
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
            <span>Explorer</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('map')}
            className={`${styles.navLink} ${activeTab === 'map' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Carte</span>
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
    </main>
  );
}

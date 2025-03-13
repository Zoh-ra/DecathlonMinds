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
  
  // Fonction pour définir un message adapté à l'émotion et à la cause
  const getEmotionMessage = () => {
    if (!emotion) return "Découvrez notre sélection de contenu adapté.";
    
    // Messages génériques basés sur l'émotion
    let baseMessage = "";
    switch (emotion) {
      case 'HAPPY':
      case 'JOYFUL':
      case 'CONFIDENT':
        baseMessage = "Super ! Continuez sur cette lancée positive";
        break;
      case 'SAD':
      case 'MELANCHOLIC':
        baseMessage = "Nous avons sélectionné du contenu pour vous réconforter";
        break;
      case 'ANXIOUS':
      case 'FRUSTRATED':
        baseMessage = "Respirez profondément. Voici du contenu qui pourrait vous aider à vous apaiser";
        break;
      case 'TIRED':
      case 'EXHAUSTED':
        baseMessage = "Prenez votre temps. Nous avons sélectionné du contenu adapté pour vous revitaliser";
        break;
      default:
        baseMessage = `Voici du contenu adapté à votre humeur`;
    }
    
    // Personnalisation basée sur la cause
    if (cause) {
      switch (cause.toLowerCase()) {
        case 'travail':
        case 'work':
          return `${baseMessage} concernant le stress professionnel. Équilibrer vie professionnelle et bien-être est essentiel.`;
        case 'sport':
        case 'exercise':
          return `${baseMessage} en lien avec vos activités sportives. L'activité physique est un excellent moyen de gérer les émotions.`;
        case 'relation':
        case 'family':
        case 'famille':
          return `${baseMessage} concernant vos relations. Des liens sociaux de qualité sont importants pour votre bien-être.`;
        case 'santé':
        case 'health':
          return `${baseMessage} en rapport avec votre santé. Prendre soin de soi est la première étape vers le bien-être.`;
        case 'finances':
        case 'money':
        case 'argent':
          return `${baseMessage} pour vous aider à gérer le stress financier. Bien-être et finances peuvent aller de pair.`;
        default:
          return `${baseMessage} en fonction de votre situation: ${cause}.`;
      }
    }
    
    return `${baseMessage} avec notre sélection de contenu.`;
  };
  
  // Récupérer les posts depuis l'API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construire l'URL avec les paramètres de filtrage
      let url = '/api/feed/openai?';
      
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
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/logo/LogoBleu.png" 
            alt="myMind Logo" 
            width={80} 
            height={80} 
          />
        </div>
        
        {/* Message adapté à l'émotion */}
        {emotion && (
          <div className={styles.emotionMessage}>
            {getEmotionMessage()}
          </div>
        )}
        
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Explorer</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('suivi')}
            className={`${styles.navLink} ${activeTab === 'suivi' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Suivi</span>
          </div>
        </div>
        <div className={styles.navButton}>
          <div 
            onClick={() => handleTabChange('profil')}
            className={`${styles.navLink} ${activeTab === 'profil' ? styles.active : ''}`}
          >
            <div className={styles.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Profil</span>
          </div>
        </div>
      </div>
    </main>
  );
}

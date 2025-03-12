'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import FeedPostCard from '@/components/Feed/FeedPostCard';
import { Post, PostType } from '@/types/feed';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostType | 'ALL'>('ALL');
  const searchParams = useSearchParams();
  
  // Récupérer l'émotion et la cause des paramètres d'URL
  const emotion = searchParams.get('emotion');
  const cause = searchParams.get('cause');
  
  // Message adapté à l'émotion de l'utilisateur
  const getEmotionMessage = () => {
    if (!emotion) return null;
    
    switch (emotion.toLowerCase()) {
      case 'happy':
      case 'joy':
        return "Excellent ! Nous avons sélectionné du contenu pour entretenir votre bonne humeur.";
      case 'sad':
      case 'sadness':
        return "Nous avons préparé du contenu qui pourrait vous aider à vous sentir mieux.";
      case 'angry':
      case 'anger':
        return "Voici des suggestions qui pourraient vous aider à canaliser cette énergie.";
      case 'anxious':
      case 'anxiety':
      case 'worried':
        return "Respirez profondément. Nous avons trouvé du contenu pour vous aider à vous détendre.";
      case 'tired':
      case 'fatigue':
        return "Prenez votre temps. Nous avons sélectionné du contenu adapté pour vous revitaliser.";
      default:
        return `Voici du contenu adapté à votre humeur : ${emotion}.`;
    }
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
      
      // Ajouter le filtre actif s'il n'est pas sur 'ALL'
      if (activeFilter !== 'ALL') url += `filter=${encodeURIComponent(activeFilter)}&`;
      
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
  }, [emotion, cause, activeFilter]);
  
  // Filtrer les posts par type
  const handleFilterChange = (filter: PostType | 'ALL') => {
    setActiveFilter(filter);
    
    // Si le filtre a changé pour autre chose que 'ALL',
    // récupérer de nouveaux posts avec le filtre
    if (filter !== activeFilter) {
      // Nous allons rafraîchir les posts avec le nouveau filtre
      fetchPosts();
    }
  };
  
  // Charger les posts au chargement initial ou quand les paramètres changent
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, emotion, cause, activeFilter]);

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
        
        {/* Filtres pour les types de posts */}
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'ALL' ? styles.active : ''}`}
            onClick={() => handleFilterChange('ALL')}
          >
            Tous
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'SCIENTIFIC' ? styles.active : ''}`}
            onClick={() => handleFilterChange('SCIENTIFIC')}
          >
            Articles
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'QUOTE' ? styles.active : ''}`}
            onClick={() => handleFilterChange('QUOTE')}
          >
            Citations
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'ROUTE' ? styles.active : ''}`}
            onClick={() => handleFilterChange('ROUTE')}
          >
            Parcours
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'EVENT' ? styles.active : ''}`}
            onClick={() => handleFilterChange('EVENT')}
          >
            Événements
          </button>
        </div>
        
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
            <p>Aucun post ne correspond à vos critères actuels.</p>
            <button 
              onClick={() => {
                setActiveFilter('ALL');
                fetchPosts();
              }}
              className={styles.resetButton}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

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
  
  // Filtrer les posts par type
  const handleFilterChange = (filter: PostType | 'ALL') => {
    setActiveFilter(filter);
  };
  
  // Charger les posts au chargement initial ou quand les paramètres changent
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, emotion, cause]);

  // Filtrer les posts affichés en fonction du type sélectionné
  const filteredPosts = activeFilter === 'ALL'
    ? posts
    : posts.filter(post => post.type === activeFilter);

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
        ) : filteredPosts.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>Aucun post ne correspond à vos critères actuels.</p>
            <button 
              onClick={() => {
                setActiveFilter('ALL');
              }}
              className={styles.resetButton}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {filteredPosts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

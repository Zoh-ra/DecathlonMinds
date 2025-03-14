'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Post } from '@/types/feed';
import FeedPostCard from '@/components/Feed/FeedPostCard';
import { getLatestUserJourneyEntry } from '@/utils/userJourney';
import Image from 'next/image';
import Navbar from '@/components/Navigation/Navbar';
import ProfileAvatar from '@/components/ProfileAvatar/ProfileAvatar';
import ChatbotPopup from '@/components/Chatbot/ChatbotPopup';

export default function FeedPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Récupérer l'émotion et la cause des paramètres d'URL ou du parcours utilisateur
  const emotion = searchParams.get('emotion') || undefined;
  const cause = searchParams.get('cause') || undefined;

  // États pour stocker les informations d'émotion et de cause réellement utilisées
  const [activeEmotion, setActiveEmotion] = useState<string | undefined>(emotion);
  const [activeCause, setActiveCause] = useState<string | undefined>(cause);

  // Récupérer le nom d'utilisateur du localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Ajouter des logs pour le débogage
  useEffect(() => {
    console.log('Paramètres URL:', { emotion, cause });

    // Si les paramètres ne sont pas dans l'URL, essayer de les récupérer du parcours utilisateur
    if (!emotion || !cause) {
      const latestEntry = getLatestUserJourneyEntry();
      if (latestEntry) {
        console.log('Informations récupérées du parcours utilisateur:', latestEntry);

        if (!emotion && latestEntry.emotion) {
          setActiveEmotion(latestEntry.emotion.toString());
        }

        if (!cause && latestEntry.reason) {
          setActiveCause(latestEntry.reason);
        }
      }
    }

    console.log('Informations actives pour la génération de posts:', {
      activeEmotion: activeEmotion || emotion,
      activeCause: activeCause || cause
    });
  }, [emotion, cause, activeEmotion, activeCause]);

  // Récupérer les posts depuis l'API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construire l'URL avec les paramètres de filtrage
      let url = '/api/feed/posts?';

      // Ajouter l'émotion et la cause si présentes, en utilisant 'mood' au lieu de 'emotion'
      const emotionToUse = activeEmotion || emotion;
      const causeToUse = activeCause || cause;

      if (emotionToUse) url += `mood=${encodeURIComponent(emotionToUse)}&`;
      if (causeToUse) url += `reason=${encodeURIComponent(causeToUse)}&`;

      console.log('URL de requête API:', url);

      // Récupérer les posts
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.error('Erreur API:', data.error);
        setError(data.error);
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      setError('Impossible de récupérer les posts. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [activeEmotion, activeCause, emotion, cause]);

  // Charger les posts au chargement initial ou quand les paramètres changent
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, activeEmotion, activeCause, emotion, cause]);

  // Rendu du composant
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Image
          src="/images/logo/LogoBleu.png"
          alt="DecathlonMind Logo"
          width={180}
          height={40}
          className={styles.logo}
          priority
        />
        <div className={styles.userInfo}>
          {userName && (
            <>
              <span className={styles.userName}>{userName}</span>
              <ProfileAvatar userName={userName} />
            </>
          )}
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

      {/* Composant ChatbotPopup - version popup du chatbot */}
      <ChatbotPopup emotionColor="#0082C3" />

      {/* Utilisation du composant Navbar partagé */}
      <Navbar />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import FeedPostCard from '../../components/Feed/FeedPostCard';
import { Post, PostType } from '../../types/feed';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<PostType | 'ALL'>('ALL');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Dans un environnement de production, ce serait une vraie API
        const response = await fetch('/api/feed/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Utiliser des données fictives en cas d'erreur
        setPosts(samplePosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = filter === 'ALL' 
    ? posts 
    : posts.filter(post => post.type === filter);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Décathlon Minds - Fil d&apos;actualité</h1>
        <p className={styles.description}>
          Découvrez les dernières actualités sur la marche, le jogging, et plus encore !
        </p>
        
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Tous
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'SCIENTIFIC' ? styles.active : ''}`}
            onClick={() => setFilter('SCIENTIFIC')}
          >
            Articles scientifiques
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'QUOTE' ? styles.active : ''}`}
            onClick={() => setFilter('QUOTE')}
          >
            Citations
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'ROUTE' ? styles.active : ''}`}
            onClick={() => setFilter('ROUTE')}
          >
            Parcours
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'EVENT' ? styles.active : ''}`}
            onClick={() => setFilter('EVENT')}
          >
            Événements
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement des actualités...</div>
        ) : (
          <div className={styles.feedGrid}>
            {filteredPosts.length === 0 ? (
              <div className={styles.noResults}>Aucun contenu à afficher dans cette catégorie.</div>
            ) : (
              filteredPosts.map((post) => (
                <FeedPostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Données fictives pour le développement
const samplePosts: Post[] = [
  {
    id: '1',
    type: 'SCIENTIFIC',
    title: 'Les bienfaits de la marche rapide sur la santé cognitive',
    content: 'Une nouvelle étude publiée dans le Journal of Neuroscience révèle que 30 minutes de marche rapide par jour peuvent améliorer significativement les fonctions cognitives et réduire le risque de démence de 23%.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    author: 'Dr. Marie Dupont',
    date: '2025-03-10',
    tags: ['santé', 'marche', 'cognition'],
    source: 'Journal of Neuroscience'
  },
  {
    id: '2',
    type: 'QUOTE',
    content: 'Le voyage de mille lieues commence toujours par un premier pas.',
    author: 'Lao Tseu',
    backgroundColor: '#E3F2FD',
    tags: ['motivation', 'sagesse']
  },
  {
    id: '3',
    type: 'ROUTE',
    title: 'Parcours du Parc de la Villette',
    location: 'Paris 19ème',
    distance: 5.2,
    duration: 65,
    difficulty: 'EASY',
    description: 'Un parcours idéal pour les débutants, entièrement plat et verdoyant au cœur de Paris.',
    imageUrl: 'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tags: ['paris', 'débutant', 'parc']
  },
  {
    id: '4',
    type: 'EVENT',
    title: 'Marathon de Paris 2025',
    date: '2025-04-06',
    location: 'Paris, France',
    description: 'Rejoignez-nous pour le marathon annuel de Paris, un parcours emblématique à travers les monuments les plus célèbres de la capitale française.',
    imageUrl: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    registrationLink: 'https://www.marathondeparis.com',
    tags: ['marathon', 'paris', 'compétition']
  },
  {
    id: '5',
    type: 'SCIENTIFIC',
    title: 'Marche et production d\'endorphines',
    content: 'Des chercheurs de l\'Université de Lyon ont découvert que 45 minutes de marche en nature libère autant d\'endorphines qu\'une séance d\'exercice intense, contribuant à réduire le stress et l\'anxiété.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    author: 'Prof. Jean Martin',
    date: '2025-02-28',
    tags: ['endorphines', 'marche', 'stress'],
    source: 'Revue Européenne de Physiologie'
  },
  {
    id: '6',
    type: 'QUOTE',
    content: 'Chaque pas est un progrès, peu importe sa taille.',
    author: 'Anonyme',
    backgroundColor: '#F3E5F5',
    tags: ['motivation', 'progrès']
  },
  {
    id: '7',
    type: 'ROUTE',
    title: 'Sentier côtier des Calanques',
    location: 'Marseille',
    distance: 8.7,
    duration: 180,
    difficulty: 'HARD',
    description: 'Un parcours spectaculaire longeant les calanques de Marseille, avec une vue imprenable sur la mer Méditerranée. Prévoir de bonnes chaussures et beaucoup d\'eau.',
    imageUrl: 'https://images.unsplash.com/photo-1550591713-4e392ce78e19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tags: ['calanques', 'marseille', 'difficile', 'vue']
  },
  {
    id: '8',
    type: 'EVENT',
    title: 'Randonnée nocturne pour la pleine lune',
    date: '2025-04-23',
    location: 'Forêt de Fontainebleau',
    description: 'Une expérience unique de randonnée nocturne guidée à la lumière de la pleine lune. Découvrez la forêt sous un autre angle.',
    imageUrl: 'https://images.unsplash.com/photo-1566104544262-bbefdce7592d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    registrationLink: 'https://randonnee-nocturne-fontainebleau.fr',
    tags: ['nuit', 'fontainebleau', 'pleine lune']
  }
];

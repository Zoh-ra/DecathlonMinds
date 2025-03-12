'use client';

import { useState } from 'react';
import styles from './FeedPostCard.module.css';
import { Post } from '../../types/feed';

type FeedPostCardProps = {
  post: Post;
};

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour éliminer les doublons dans les tags
  const getUniqueTags = (tags?: string[]) => {
    if (!tags) return [];
    // Utiliser un Set pour éliminer les doublons
    return [...new Set(tags)];
  };

  // Rendu basé sur le type de post
  switch (post.type) {
    case 'SCIENTIFIC':
      return (
        <div className={`${styles.card} ${styles.scientificCard}`}>
          {post.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={post.imageUrl} alt={post.title} className={styles.cardImage} />
            </div>
          )}
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <div className={styles.cardMeta}>
              <span className={styles.author}>Par {post.author}</span>
              <span className={styles.date}>{formatDate(post.date)}</span>
              <span className={styles.source}>Source: {post.source}</span>
            </div>
            <p className={`${styles.cardText} ${expanded ? styles.expanded : ''}`}>
              {post.content}
            </p>
            {post.content.length > 150 && (
              <button 
                className={styles.expandButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            <div className={styles.tagsContainer}>
              {getUniqueTags(post.tags).map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      );

    case 'QUOTE':
      return (
        <div 
          className={`${styles.card} ${styles.quoteCard}`}
          style={{ backgroundColor: post.backgroundColor || '#F8F9FA' }}
        >
          <div className={styles.quoteContent}>
            <p className={styles.quoteText}>"{post.content}"</p>
            <p className={styles.quoteAuthor}>— {post.author}</p>
          </div>
          {post.tags && (
            <div className={styles.tagsContainer}>
              {getUniqueTags(post.tags).map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      );

    case 'ROUTE':
      return (
        <div className={`${styles.card} ${styles.routeCard}`}>
          {post.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={post.imageUrl} alt={post.title} className={styles.cardImage} />
              <span className={`${styles.difficultyBadge} ${styles[`difficulty${post.difficulty}`]}`}>
                {post.difficulty === 'EASY' ? 'Facile' : 
                 post.difficulty === 'MEDIUM' ? 'Intermédiaire' : 'Difficile'}
              </span>
            </div>
          )}
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <div className={styles.routeStats}>
              <div className={styles.routeStat}>
                <span className={styles.routeStatIcon}>📍</span>
                <span>{post.location}</span>
              </div>
              <div className={styles.routeStat}>
                <span className={styles.routeStatIcon}>📏</span>
                <span>{post.distance} km</span>
              </div>
              <div className={styles.routeStat}>
                <span className={styles.routeStatIcon}>⏱️</span>
                <span>{post.duration} min</span>
              </div>
            </div>
            <p className={`${styles.cardText} ${expanded ? styles.expanded : ''}`}>
              {post.description}
            </p>
            {post.description.length > 100 && (
              <button 
                className={styles.expandButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            <button className={styles.actionButton}>
              Voir l&apos;itinéraire
            </button>
            <div className={styles.tagsContainer}>
              {getUniqueTags(post.tags).map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      );

    case 'EVENT':
      return (
        <div className={`${styles.card} ${styles.eventCard}`}>
          {post.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={post.imageUrl} alt={post.title} className={styles.cardImage} />
              <div className={styles.eventDate}>
                {formatDate(post.date)}
              </div>
            </div>
          )}
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <div className={styles.eventLocation}>
              <span className={styles.routeStatIcon}>📍</span>
              <span>{post.location}</span>
            </div>
            <p className={`${styles.cardText} ${expanded ? styles.expanded : ''}`}>
              {post.description}
            </p>
            {post.description.length > 100 && (
              <button 
                className={styles.expandButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            {post.registrationLink && (
              <a 
                href={post.registrationLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.actionButton}
              >
                S&apos;inscrire
              </a>
            )}
            <div className={styles.tagsContainer}>
              {getUniqueTags(post.tags).map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

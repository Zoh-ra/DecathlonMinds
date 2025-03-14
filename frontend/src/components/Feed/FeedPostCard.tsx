'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './FeedPostCard.module.css';
import { Post, ScientificPost, QuotePost, RoutePost, EventPost } from '@/types/feed';

// Liste d'images de secours garanties fonctionnelles
const FALLBACK_IMAGES = {
  SCIENTIFIC: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  ROUTE: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  EVENT: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
};

// Composant pour afficher une image avec fallback automatique en cas d'erreur
const SafeImage = ({ 
  src, 
  alt, 
  className, 
  postType 
}: { 
  src: string, 
  alt: string, 
  className: string, 
  postType: string 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Vérifier si l'image est valide lors du montage du composant
  useEffect(() => {
    // Fonction pour vérifier si une image existe
    const checkImage = (url: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new (typeof window !== 'undefined' ? window.Image : Object) as HTMLImageElement;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };
    
    // Vérifier l'image actuelle
    const verifyImage = async () => {
      setLoading(true);
      try {
        const valid = await checkImage(src);
        if (!valid && postType in FALLBACK_IMAGES) {
          console.log(`[ImageFallback] Image invalide détectée, remplacement: ${src}`);
          setImgSrc(FALLBACK_IMAGES[postType as keyof typeof FALLBACK_IMAGES]);
          setError(true);
        }
      } catch (e) {
        console.error('Erreur lors de la vérification de l\'image:', e);
        if (postType in FALLBACK_IMAGES) {
          setImgSrc(FALLBACK_IMAGES[postType as keyof typeof FALLBACK_IMAGES]);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    verifyImage();
  }, [src, postType]);
  
  // Gérer les erreurs lors du chargement de l'image
  const handleImageError = () => {
    if (postType in FALLBACK_IMAGES && !error) {
      console.log(`[ImageFallback] Erreur de chargement, remplacement: ${imgSrc}`);
      setImgSrc(FALLBACK_IMAGES[postType as keyof typeof FALLBACK_IMAGES]);
      setError(true);
    }
  };
  
  return (
    <div className={styles.imageContainer}>
      {loading && <div className={styles.imagePlaceholder} />}
      <Image 
        src={imgSrc}
        alt={alt}
        className={className}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={handleImageError}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

interface FeedPostCardProps {
  post: Post;
}

const FeedPostCard = ({ post }: FeedPostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Toggle text expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Map emotion tags to specific styling classes
  const getEmotionClass = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (['happy', 'joyful', 'confident'].includes(lowerTag)) {
      return styles['emotion-happy'];
    } else if (['sad', 'melancholic'].includes(lowerTag)) {
      return styles['emotion-sad'];
    } else if (['anxious', 'frustrated'].includes(lowerTag)) {
      return styles['emotion-anxious'];
    }
    return '';
  };

  // Render the appropriate card based on post type
  switch (post.type) {
    case 'SCIENTIFIC': {
      const scientificPost = post as ScientificPost;
      return (
        <div className={`${styles.card}`}>
          {scientificPost.imageUrl && (
            <SafeImage 
              src={scientificPost.imageUrl}
              alt={scientificPost.title || 'Scientific article image'}
              className={styles.cardImage}
              postType="SCIENTIFIC"
            />
          )}
          <div className={styles.cardContent}>
            {scientificPost.author && (
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {getInitials(scientificPost.author)}
                </div>
                <div className={styles.author}>
                  {scientificPost.author}
                </div>
              </div>
            )}
            
            <h2 className={styles.cardTitle}>{scientificPost.title}</h2>
            
            <div className={styles.cardMeta}>
              {scientificPost.date && (
                <span className={styles.date}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {formatDate(scientificPost.date)}
                </span>
              )}
              
              {scientificPost.source && (
                <span className={styles.source}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {scientificPost.source}
                </span>
              )}
            </div>
            
            <div className={`${styles.cardText} ${isExpanded ? styles.expanded : ''}`}>
              {scientificPost.content}
            </div>
            
            {scientificPost.content && scientificPost.content.length > 150 && (
              <button onClick={toggleExpand} className={styles.expandButton}>
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            
            <a 
              href={`https://www.decathlon.fr/search?Ntt=${encodeURIComponent(scientificPost.title)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.actionButton}
            >
              Lire l&apos;article complet
            </a>
            
            {scientificPost.tags && scientificPost.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {scientificPost.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${styles.tag} ${getEmotionClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
      
    case 'QUOTE': {
      const quotePost = post as QuotePost;
      return (
        <div className={`${styles.card}`}>
          <div className={styles.cardContent}>
            <div className={styles.quoteContent}>
              &quot;{quotePost.content}&quot;
            </div>
            
            {quotePost.author && (
              <div className={styles.quoteAuthor}>
                — {quotePost.author}
              </div>
            )}
            
            {quotePost.tags && quotePost.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {quotePost.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${styles.tag} ${getEmotionClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
      
    case 'ROUTE': {
      const routePost = post as RoutePost;
      return (
        <div className={`${styles.card}`}>
          {routePost.imageUrl && (
            <SafeImage 
              src={routePost.imageUrl}
              alt={routePost.title || 'Route image'}
              className={styles.cardImage}
              postType="ROUTE"
            />
          )}
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>{routePost.title}</h2>
            
            <div className={`${styles.cardText} ${isExpanded ? styles.expanded : ''}`}>
              {routePost.description}
            </div>
            
            {routePost.description && routePost.description.length > 150 && (
              <button onClick={toggleExpand} className={styles.expandButton}>
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            
            {(routePost.distance || routePost.duration) && (
              <div className={styles.routeInfo}>
                {routePost.distance && (
                  <div className={styles.routeDetail}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 2L21 6L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 18L7 22L3 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 6H7C4.79086 6 3 7.79086 3 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {routePost.distance} km
                  </div>
                )}
                
                {routePost.duration && (
                  <div className={styles.routeDetail}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {routePost.duration} min
                  </div>
                )}
              </div>
            )}
            
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(routePost.location)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.actionButton}
            >
              Voir l&apos;itinéraire
            </a>
            
            {routePost.tags && routePost.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {routePost.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${styles.tag} ${getEmotionClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
      
    case 'EVENT': {
      const eventPost = post as EventPost;
      return (
        <div className={`${styles.card}`}>
          {eventPost.imageUrl && (
            <SafeImage 
              src={eventPost.imageUrl}
              alt={eventPost.title || 'Event image'}
              className={styles.cardImage}
              postType="EVENT"
            />
          )}
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>{eventPost.title}</h2>
            
            <div className={`${styles.cardText} ${isExpanded ? styles.expanded : ''}`}>
              {eventPost.description}
            </div>
            
            {eventPost.description && eventPost.description.length > 150 && (
              <button onClick={toggleExpand} className={styles.expandButton}>
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
            
            <div className={styles.eventDetails}>
              {eventPost.date && (
                <div className={styles.eventDetail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {formatDate(eventPost.date)}
                </div>
              )}
              
              {eventPost.location && (
                <div className={styles.eventDetail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {eventPost.location}
                </div>
              )}
            </div>
            
            {eventPost.registrationLink && (
              <a 
                href={eventPost.registrationLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.actionButton}
              >
                S&apos;inscrire à l&apos;événement
              </a>
            )}
            
            {eventPost.tags && eventPost.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {eventPost.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${styles.tag} ${getEmotionClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
      
    default:
      return null;
  }
};

export default FeedPostCard;

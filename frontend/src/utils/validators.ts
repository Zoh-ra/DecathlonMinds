import { Post, ScientificPost, EventPost, RoutePost } from '@/types/feed';

const MIN_EVENT_DATE = new Date('2025-03-01');

/**
 * Utilitaire de validation des posts selon les règles de l'application:
 * - Pas d'images avec des humains
 * - Événements avec dates futures (après 01/03/2025)
 * - Sources vérifiables pour les posts scientifiques
 */

/**
 * Valide un post selon les règles métier
 * @param post Post à valider
 * @returns Liste des erreurs de validation (vide si pas d'erreur)
 */
export const validatePost = async (post: Post): Promise<string[]> => {
  const errors: string[] = [];
  
  // Vérification des images contenant des humains
  if ('imageUrl' in post && post.imageUrl && post.imageUrl.trim() !== '') {
    if (await containsHumans(post.imageUrl)) {
      errors.push('Les images contenant des humains ne sont pas autorisées pour les posts');
    }
  }
  
  // Vérification de la date pour les événements (doit être après le 01/03/2025)
  if (post.type === 'EVENT') {
    const eventPost = post as EventPost;
    const postDate = eventPost.date ? new Date(eventPost.date) : null;
    if (!postDate || postDate < MIN_EVENT_DATE) {
      errors.push('Les événements doivent avoir une date future (après le 01/03/2025)');
    }
  }
  
  // Vérification des sources pour les posts scientifiques
  if (post.type === 'SCIENTIFIC') {
    const scientificPost = post as ScientificPost;
    if (!scientificPost.source || scientificPost.source.trim() === '') {
      errors.push('Les posts scientifiques doivent avoir une source');
    } else if (!isValidUrl(scientificPost.source)) {
      errors.push('La source doit être une URL valide');
    } else {
      try {
        const isAccessible = await isSourceAccessible(scientificPost.source);
        if (!isAccessible) {
          errors.push('La source doit être accessible');
        }
      } catch (err) {
        console.error('Erreur de validation de source:', err);
        errors.push('Impossible de vérifier l\'accessibilité de la source');
      }
    }
  }
  
  return errors;
};

/**
 * Détecte si une image contient des humains
 * Note: Cette implémentation est simplifiée. En production, il faudrait
 * utiliser une API comme Google Cloud Vision, Amazon Rekognition, ou
 * Microsoft Computer Vision.
 */
export const containsHumans = async (imageUrl: string): Promise<boolean> => {
  // Implémentation simplifiée basée sur le nom de l'image
  // En production, remplacer par un appel à une API d'analyse d'image
  const lowercaseUrl = imageUrl.toLowerCase();
  return lowercaseUrl.includes('person') || 
         lowercaseUrl.includes('people') || 
         lowercaseUrl.includes('human') ||
         lowercaseUrl.includes('portrait') ||
         lowercaseUrl.includes('face');
};

/**
 * Vérifie si une chaîne est une URL valide
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Vérifie si une URL est accessible
 */
export const isSourceAccessible = async (urlString: string): Promise<boolean> => {
  try {
    // Dans un environnement Next.js, nous utilisons une API route pour vérifier l'accessibilité
    const response = await fetch(`/api/check-url?url=${encodeURIComponent(urlString)}`);
    const data = await response.json();
    return data.isAccessible;
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'URL:', err);
    return false;
  }
};

/**
 * Type pour représenter un post avec une distance calculée
 */
type PostWithDistance = Post & { calculatedDistance?: number };

/**
 * Adapte le contenu en fonction de l'émotion, de la cause et de la géolocalisation
 * @param post Un post ou une liste de posts à filtrer et adapter
 * @param userContext Le contexte utilisateur (émotion, cause, localisation)
 * @returns Post(s) filtré(s) et adapté(s)
 */
export const adaptContentToUser = (
  post: Post | Post[],
  userContext?: { lat?: number; lng?: number; mood?: string | null; reason?: string | null }
): Post | PostWithDistance[] => {
  // Si c'est un post unique, le convertir en tableau pour le traitement
  const postsArray = Array.isArray(post) ? post : [post];
  const { lat, lng, mood, reason } = userContext || {};
  
  // Faire une copie pour ne pas modifier l'original
  let adaptedPosts = [...postsArray] as PostWithDistance[];
  
  // 1. Filtrer selon l'émotion (priorité la plus haute)
  if (mood) {
    // Les posts ayant des tags correspondant à l'émotion sont prioritaires
    adaptedPosts.sort((a, b) => {
      const aHasEmotionTag = a.tags?.some((tag: string) => 
        tag.toLowerCase().includes(mood.toLowerCase())
      ) ?? false;
      
      const bHasEmotionTag = b.tags?.some((tag: string) => 
        tag.toLowerCase().includes(mood.toLowerCase())
      ) ?? false;
      
      if (aHasEmotionTag && !bHasEmotionTag) return -1;
      if (!aHasEmotionTag && bHasEmotionTag) return 1;
      return 0;
    });
  }
  
  // 2. Filtrer selon la cause (deuxième priorité)
  if (reason) {
    // Réorganiser pour que les posts liés à la cause soient mis en avant
    adaptedPosts.sort((a, b) => {
      // Garder l'ordre précédent si les deux posts ont le même statut vis-à-vis de l'émotion
      const aHasEmotionTag = mood ? a.tags?.some((tag: string) => 
        tag.toLowerCase().includes(mood.toLowerCase())
      ) ?? false : false;
      
      const bHasEmotionTag = mood ? b.tags?.some((tag: string) => 
        tag.toLowerCase().includes(mood.toLowerCase())
      ) ?? false : false;
      
      if (aHasEmotionTag !== bHasEmotionTag) {
        return aHasEmotionTag ? -1 : 1;
      }
      
      // Ensuite, considérer la cause
      const aHasCauseTag = a.tags?.some((tag: string) => 
        tag.toLowerCase().includes(reason.toLowerCase())
      ) ?? false;
      
      const bHasCauseTag = b.tags?.some((tag: string) => 
        tag.toLowerCase().includes(reason.toLowerCase())
      ) ?? false;
      
      if (aHasCauseTag && !bHasCauseTag) return -1;
      if (!aHasCauseTag && bHasCauseTag) return 1;
      return 0;
    });
  }
  
  // 3. Filtrer selon la localisation (si disponible)
  if (lat && lng) {
    // Calculer la distance entre chaque post et l'utilisateur
    // Prioriser les posts proches de l'utilisateur (si le post a une localisation)
    adaptedPosts = adaptedPosts.map(post => {
      // Vérifier si c'est un post de type ROUTE ou EVENT qui a une localisation
      if ((post.type === 'ROUTE' || post.type === 'EVENT') && 'location' in post) {
        try {
          const locationPost = post as RoutePost | EventPost;
          // Si le post a des coordonnées, calculer la distance
          const postCoords = extractCoordinates(locationPost.location);
          if (postCoords) {
            const distance = calculateDistance(
              lat, 
              lng,
              postCoords.lat,
              postCoords.lng
            );
            return { ...post, calculatedDistance: distance };
          }
        } catch (err) {
          console.error('Erreur lors du calcul de distance:', err);
        }
      }
      return post;
    });
    
    // Trier en fonction de la distance (si disponible)
    adaptedPosts.sort((a, b) => {
      // Si une calculatedDistance existe, utiliser cette information pour trier
      if (a.calculatedDistance !== undefined && b.calculatedDistance !== undefined) {
        return a.calculatedDistance - b.calculatedDistance;
      }
      
      // Si seul un post a une distance, le privilégier
      if (a.calculatedDistance !== undefined) return -1;
      if (b.calculatedDistance !== undefined) return 1;
      
      // Sinon, garder l'ordre existant
      return 0;
    });
  }
  
  // Retourner soit le tableau, soit le premier élément selon le type d'entrée
  return Array.isArray(post) ? adaptedPosts : adaptedPosts[0];
};

/**
 * Convertit une chaîne de localisation en coordonnées 
 * Format attendu: "latitude,longitude" ou texte descriptif
 */
export const extractCoordinates = (location: string): { lat: number; lng: number } | null => {
  // Vérifier si c'est un format de coordonnées "lat,lng"
  const coords = location.split(',').map(num => parseFloat(num.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return { lat: coords[0], lng: coords[1] };
  }
  
  // Sinon, considérer que c'est un texte descriptif
  // En production, utiliser une API de géocodage (Google Maps, OpenStreetMap, etc.)
  return null;
};

/**
 * Calcule la distance (en km) entre deux points avec la formule de Haversine
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

// Système de cache pour les posts générés
import { Post } from '../types/feed';

interface CacheKey {
  type: string;
  mood?: string;
  reason?: string;
}

interface CacheEntry {
  posts: Post[];
  timestamp: number;
  expiryTime: number; // Temps en ms avant expiration
}

// Cache en mémoire
const postCache: Map<string, CacheEntry> = new Map();

// Convertir la clé en string pour le stockage
const getCacheKey = (key: CacheKey): string => {
  return `${key.type}|${key.mood || 'any'}|${key.reason || 'any'}`;
};

// Vérifier si une entrée est dans le cache et valide
export const isCacheValid = (key: CacheKey, maxAge: number = 30 * 60 * 1000): boolean => {
  const cacheKey = getCacheKey(key);
  const entry = postCache.get(cacheKey);
  
  if (!entry) return false;
  
  const now = Date.now();
  return (now - entry.timestamp) < maxAge;
};

// Obtenir un post du cache
export const getCachedPost = (key: CacheKey): Post | null => {
  const cacheKey = getCacheKey(key);
  const entry = postCache.get(cacheKey);
  
  if (!entry || entry.posts.length === 0) return null;
  
  // Retourner un post aléatoire du cache pour ce type/humeur/raison
  const randomIndex = Math.floor(Math.random() * entry.posts.length);
  return entry.posts[randomIndex];
};

// Ajouter un post au cache
export const addPostToCache = (key: CacheKey, post: Post, expiryTime: number = 30 * 60 * 1000): void => {
  const cacheKey = getCacheKey(key);
  const entry = postCache.get(cacheKey);
  
  if (entry) {
    // Ajouter à l'entrée existante
    entry.posts.push(post);
  } else {
    // Créer une nouvelle entrée
    postCache.set(cacheKey, {
      posts: [post],
      timestamp: Date.now(),
      expiryTime
    });
  }
  
  console.log(`[Cache] Post ajouté au cache pour la clé ${cacheKey}`);
};

// Posts pré-générés pour les scénarios courants
export const preCachedPosts: Record<string, Post[]> = {
  // Posts pour une personne heureuse
  'SCIENTIFIC|HAPPY|any': [
    {
      id: 'pre-happy-scientific-1',
      type: 'SCIENTIFIC',
      title: 'La marche rapide booste les endorphines et prolonge l\'euphorie',
      content: 'Une équipe de l\'Université de Stanford a démontré que 30 minutes de marche rapide peut prolonger un état d\'euphorie naturelle et amplifier les sentiments positifs déjà présents.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Dr. Emma Johnson',
      date: '2025-02-18',
      tags: ['bien-être', 'endorphines', 'marche rapide'],
      source: 'Journal of Happiness Studies'
    },
    {
      id: 'pre-happy-scientific-2',
      type: 'SCIENTIFIC',
      title: 'Marcher avec une personne heureuse augmente votre propre bonheur de 25%',
      content: 'Une étude de l\'Université de Zurich révèle que marcher 15 minutes avec une personne de bonne humeur peut augmenter votre propre niveau de bonheur de 25% grâce à un phénomène de contagion émotionnelle positive.',
      imageUrl: 'https://images.unsplash.com/photo-1557674961-3ccc0c7c5086?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Prof. Laura Schmidt',
      date: '2025-01-25',
      tags: ['bonheur', 'contagion émotionnelle', 'groupe'],
      source: 'Journal of Positive Psychology'
    }
  ],
  'QUOTE|HAPPY|any': [
    {
      id: 'pre-happy-quote-1',
      type: 'QUOTE',
      content: 'Le bonheur n\'est pas une destination à atteindre mais une façon de voyager.',
      author: 'Margaret Lee Runbeck',
      backgroundColor: '#E8F5E9',
      tags: ['bonheur', 'voyage']
    },
    {
      id: 'pre-happy-quote-2',
      type: 'QUOTE',
      content: 'Marcher d\'un pas léger, c\'est laisser la joie guider chacun de vos mouvements.',
      author: 'Anne Lamott',
      backgroundColor: '#FFF9C4',
      tags: ['joie', 'mouvement', 'légèreté']
    }
  ],
  'ROUTE|HAPPY|any': [
    {
      id: 'pre-happy-route-1',
      type: 'ROUTE',
      title: 'Sentier des Crêtes Ensoleillées',
      location: 'Parc National des Calanques, Marseille',
      distance: 7.5,
      duration: 150,
      difficulty: 'MEDIUM',
      description: 'Un parcours panoramique offrant des vues spectaculaires sur la Méditerranée. Les points de vue exceptionnels amplifient la sensation de bien-être et d\'émerveillement.',
      imageUrl: 'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['vue panoramique', 'méditerranée', 'bien-être', 'nature']
    }
  ],
  'EVENT|HAPPY|any': [
    {
      id: 'pre-happy-event-1',
      type: 'EVENT',
      title: 'Festival de la Marche Heureuse',
      date: '2025-05-15',
      location: 'Parc de la Tête d\'Or, Lyon',
      description: 'Une journée dédiée à la marche joyeuse avec ateliers de sourire en marchant, parcours musicaux et rencontres positives. Ambiance festive garantie!',
      imageUrl: 'https://images.unsplash.com/photo-1533923156502-be31530547c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      registrationLink: 'https://www.festival-marche-heureuse.fr',
      tags: ['festival', 'joie', 'lyon', 'bien-être']
    }
  ],
  
  // Posts pour une personne stressée
  'SCIENTIFIC|STRESSED|any': [
    {
      id: 'pre-stressed-scientific-1',
      type: 'SCIENTIFIC',
      title: 'La marche en forêt réduit de 60% les hormones du stress',
      content: 'Des chercheurs japonais ont mesuré une réduction moyenne de 60% du cortisol après seulement 20 minutes de marche en environnement forestier, contre 15% en milieu urbain.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Prof. Hiroshi Tanaka',
      date: '2025-01-12',
      tags: ['stress', 'sylvothérapie', 'cortisol'],
      source: 'Environmental Health and Preventive Medicine'
    },
    {
      id: 'pre-stressed-scientific-2',
      type: 'SCIENTIFIC',
      title: 'Marcher 12 minutes améliore la résistance au stress pendant 4 heures',
      content: 'Une étude de l\'Université de Californie démontre qu\'une marche de seulement 12 minutes dans un environnement naturel augmente significativement la résilience au stress pendant les 4 heures suivantes.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Dr. Michael Chen',
      date: '2025-02-28',
      tags: ['stress', 'résilience', 'marche courte'],
      source: 'Journal of Environmental Psychology'
    }
  ],
  'QUOTE|STRESSED|any': [
    {
      id: 'pre-stressed-quote-1',
      type: 'QUOTE',
      content: 'Marcher, c\'est mettre un pied devant l\'autre et laisser le stress derrière soi.',
      author: 'Jon Kabat-Zinn',
      backgroundColor: '#E1F5FE',
      tags: ['anti-stress', 'simplicité']
    }
  ],
  'ROUTE|STRESSED|any': [
    {
      id: 'pre-stressed-route-1',
      type: 'ROUTE',
      title: 'Sentier des 5 Sens - Parcours Anti-stress',
      location: 'Forêt de Fontainebleau',
      distance: 4.5,
      duration: 75,
      difficulty: 'EASY',
      description: 'Un parcours thérapeutique conçu pour engager les 5 sens et réduire le stress. Inclut des zones de respiration profonde et points de méditation.',
      imageUrl: 'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['anti-stress', 'méditation', 'respiration', 'nature']
    },
    {
      id: 'pre-stressed-route-2',
      type: 'ROUTE',
      title: 'Boucle des Cascades Apaisantes',
      location: 'Parc naturel régional du Vercors',
      distance: 3.8,
      duration: 60,
      difficulty: 'EASY',
      description: 'Un parcours relaxant le long de cascades dont le bruit apaisant de l\'eau agit comme un réducteur naturel de stress. Idéal pour une déconnexion rapide.',
      imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['cascade', 'relaxation', 'eau', 'nature']
    }
  ],

  // Posts pour une personne fatiguée (TIRED)
  'SCIENTIFIC|TIRED|any': [
    {
      id: 'pre-tired-scientific-1',
      type: 'SCIENTIFIC',
      title: 'Une marche de 15 minutes est plus efficace qu\'un café contre la fatigue',
      content: 'Des chercheurs de l\'Université de Géorgie ont démontré qu\'une marche de 15 minutes à intensité modérée réduit la sensation de fatigue de 65%, soit plus efficacement qu\'une tasse de café (40%).',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Dr. Sarah Williams',
      date: '2025-03-05',
      tags: ['fatigue', 'énergie', 'marche courte'],
      source: 'Journal of Applied Physiology'
    }
  ],
  'ROUTE|TIRED|any': [
    {
      id: 'pre-tired-route-1',
      type: 'ROUTE',
      title: 'Parcours Revitalisant du Lac',
      location: 'Lac d\'Annecy, Haute-Savoie',
      distance: 2.5,
      duration: 40,
      difficulty: 'EASY',
      description: 'Une promenade douce au bord du lac avec plusieurs bancs pour se reposer. L\'air frais et la vue sur l\'eau ont des effets prouvés pour combattre la fatigue mentale.',
      imageUrl: 'https://images.unsplash.com/photo-1550591713-4e392ce78e19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['lac', 'repos', 'facile', 'air frais']
    }
  ],

  // Posts pour une personne énergique (ENERGETIC)
  'ROUTE|ENERGETIC|any': [
    {
      id: 'pre-energetic-route-1',
      type: 'ROUTE',
      title: 'Sentier de l\'Adrénaline',
      location: 'Massif du Mont-Blanc, Chamonix',
      distance: 12.8,
      duration: 240,
      difficulty: 'HARD',
      description: 'Un parcours dynamique avec dénivelés importants pour les marcheurs en pleine forme. Les vues spectaculaires et passages techniques offrent un exutoire parfait pour votre énergie débordante.',
      imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['défi', 'montagne', 'intense', 'aventure']
    }
  ],
  'EVENT|ENERGETIC|any': [
    {
      id: 'pre-energetic-event-1',
      type: 'EVENT',
      title: 'Challenge des 30km en Montagne',
      date: '2025-07-12',
      location: 'Massif des Vosges',
      description: 'Un défi sportif pour les marcheurs pleins d\'énergie: 30km de sentiers de montagne à compléter en une journée. Plusieurs points de ravitaillement et une médaille à l\'arrivée!',
      imageUrl: 'https://images.unsplash.com/photo-1566104544262-bbefdce7592d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      registrationLink: 'https://www.challenge-30km-vosges.fr',
      tags: ['défi', 'longue distance', 'montagne', 'compétition']
    }
  ],

  // Posts pour des émotions spécifiques liées au travail
  'SCIENTIFIC|STRESSED|travail': [
    {
      id: 'pre-stressed-work-scientific-1',
      type: 'SCIENTIFIC',
      title: 'Marcher pendant la pause déjeuner réduit le stress professionnel de 37%',
      content: 'Une étude menée auprès de 2000 employés de bureau montre qu\'une marche de 20 minutes pendant la pause déjeuner réduit le stress lié au travail de 37% et améliore la concentration pour l\'après-midi.',
      imageUrl: 'https://images.unsplash.com/photo-1557674961-3ccc0c7c5086?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Dr. Thomas Bergman',
      date: '2025-02-10',
      tags: ['travail', 'pause', 'stress professionnel', 'concentration'],
      source: 'Journal of Occupational Health'
    }
  ],
  'ROUTE|STRESSED|travail': [
    {
      id: 'pre-stressed-work-route-1',
      type: 'ROUTE',
      title: 'Parcours Urbain Déconnexion',
      location: 'La Défense, Paris',
      distance: 3.2,
      duration: 45,
      difficulty: 'EASY',
      description: 'Un parcours urbain stratégiquement conçu pour s\'éloigner des zones de bureaux et découvrir des espaces verts cachés. Idéal pour décompresser après une journée de travail stressante.',
      imageUrl: 'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['urbain', 'après-travail', 'décompression', 'espaces verts']
    }
  ],
  
  // Fallbacks génériques
  'EVENT|any|any': [
    {
      id: 'pre-generic-event-1',
      type: 'EVENT',
      title: 'Journée Mondiale de la Marche',
      date: '2025-06-15',
      location: 'Partout en France',
      description: 'Une journée dédiée à la promotion de la marche comme activité physique accessible à tous. Nombreux événements organisés dans toute la France.',
      imageUrl: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      registrationLink: 'https://www.journeedelamarche.fr',
      tags: ['événement', 'marche', 'national']
    },
    {
      id: 'pre-generic-event-2',
      type: 'EVENT',
      title: 'Marche Nordique - Initiation et Perfectionnement',
      date: '2025-04-22',
      location: 'Parc de Sceaux, Île-de-France',
      description: 'Une journée d\'initiation et de perfectionnement à la marche nordique encadrée par des coachs professionnels. Bâtons fournis, tous niveaux bienvenus.',
      imageUrl: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      registrationLink: 'https://www.marche-nordique-paris.fr',
      tags: ['marche nordique', 'coaching', 'initiation', 'technique']
    }
  ],
  'SCIENTIFIC|any|any': [
    {
      id: 'pre-generic-scientific-1',
      type: 'SCIENTIFIC',
      title: 'La marche régulière ralentit le vieillissement cellulaire',
      content: 'Une étude longitudinale sur 20 ans révèle que marcher au moins 30 minutes par jour réduit le raccourcissement des télomères, un marqueur biologique du vieillissement cellulaire.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      author: 'Dr. Jean-Paul Martin',
      date: '2025-03-01',
      tags: ['longévité', 'vieillissement', 'santé', 'télomères'],
      source: 'Aging Cell'
    }
  ],
  'QUOTE|any|any': [
    {
      id: 'pre-generic-quote-1',
      type: 'QUOTE',
      content: 'Si vous voulez aller vite, marchez seul. Si vous voulez aller loin, marchez ensemble.',
      author: 'Proverbe africain',
      backgroundColor: '#E3F2FD',
      tags: ['sagesse', 'collaboration']
    }
  ]
};

// Initialiser le cache avec des données pré-générées
export const initializeCache = (): void => {
  Object.entries(preCachedPosts).forEach(([key, posts]) => {
    const [type, mood, reason] = key.split('|');
    
    posts.forEach(post => {
      addPostToCache(
        { 
          type, 
          mood: mood !== 'any' ? mood : undefined, 
          reason: reason !== 'any' ? reason : undefined 
        }, 
        post
      );
    });
  });
  
  console.log('[Cache] Cache initialisé avec les données pré-générées');
};

// Nettoyer le cache des entrées expirées
export const cleanupCache = (): void => {
  const now = Date.now();
  let expiredCount = 0;
  
  postCache.forEach((entry, key) => {
    if ((now - entry.timestamp) > entry.expiryTime) {
      postCache.delete(key);
      expiredCount++;
    }
  });
  
  if (expiredCount > 0) {
    console.log(`[Cache] ${expiredCount} entrées expirées supprimées du cache`);
  }
};

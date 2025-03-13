// Types de posts disponibles dans le fil d'actualité
export type PostType = 'SCIENTIFIC' | 'QUOTE' | 'ROUTE' | 'EVENT';

// Difficulté des parcours
export type RouteDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Interface de base pour tous les posts
interface BasePost {
  id: string;
  type: PostType;
  tags?: string[];
}

// Post d'article scientifique
export interface ScientificPost extends BasePost {
  type: 'SCIENTIFIC';
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  source: string;
}

// Post de citation motivante
export interface QuotePost extends BasePost {
  type: 'QUOTE';
  content: string;
  author: string;
  backgroundColor?: string;
}

// Post de parcours de marche ou jogging
export interface RoutePost extends BasePost {
  type: 'ROUTE';
  title: string;
  location: string;
  distance: number; // en km
  duration: number; // en minutes
  difficulty: RouteDifficulty;
  description: string;
  imageUrl: string;
}

// Post d'événement
export interface EventPost extends BasePost {
  type: 'EVENT';
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  registrationLink?: string;
}

// Type union pour tous les types de posts
export type Post = ScientificPost | QuotePost | RoutePost | EventPost;

// Types d'humeurs/émotions supportées
export type Mood =
  | "HAPPY"
  | "CONTENT"
  | "MELANCHOLIC"
  | "FRUSTRATED"
  | "JOYFUL"
  | "CONFIDENT"
  | "DISAPPOINTED"
  | "ANXIOUS"
  | "EXCITED"
  | "SAD"
  | "ANGRY"
  | "STRESSED"
  | "INJURED"
  | "CONFUSED"
  | "NERVOUS";

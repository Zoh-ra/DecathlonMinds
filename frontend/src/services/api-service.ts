/**
 * Service centralisé pour les appels API vers le backend Spring Boot
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Vérification de la disponibilité du backend
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 seconde timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'API backend:', error);
    return false;
  }
};

/**
 * Requête générique vers l'API backend
 */
export const fetchFromApi = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Vérifier d'abord si le backend est disponible
    const isBackendAvailable = await checkBackendHealth();
    
    if (!isBackendAvailable) {
      throw new Error('Le backend n\'est pas disponible');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Erreur lors de l'appel API ${endpoint}:`, error);
    throw error;
  }
};

// Types pour les différentes données API
export interface EmotionalQuote {
  quote: string;
  author: string;
}

export interface EmotionalEntry {
  emotion: string;
  cause: string;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location?: string;
  weatherConditions?: string;
}

export interface ScientificArticle {
  id?: string;
  title: string;
  content: string;
  source: string;
  url: string;
  date: string;
  tags: string[];
}

export interface MotivationMessage {
  message: string;
}

export interface ChatRequest {
  message: string;
  emotion?: string;
  reason?: string;
}

export interface ChatResponse {
  response: string;
}

export interface ConversationData {
  userMessage: string;
  botResponse: string;
  emotion?: string;
  reason?: string;
  timestamp: string;
}

export interface FeedPost {
  id?: string;
  type: string;
  title: string;
  content: string;
  imageUrl?: string;
  author?: string;
  source?: string;
  location?: string;
  date?: string;
  tags?: string[];
}

// Méthodes spécifiques pour les différents types d'appels API

export const getEmotionalQuote = async (emotion: string): Promise<EmotionalQuote> => {
  return fetchFromApi<EmotionalQuote>(`/emotion/quote?emotion=${encodeURIComponent(emotion)}`);
};

export const saveEmotionalEntry = async (entryData: EmotionalEntry): Promise<void> => {
  return fetchFromApi<void>('/emotion/entry', {
    method: 'POST',
    body: JSON.stringify(entryData),
  });
};

export const getScientificArticles = async (query: string = ''): Promise<ScientificArticle[]> => {
  const endpoint = query ? `/scientificArticles?q=${encodeURIComponent(query)}` : '/scientificArticles';
  return fetchFromApi<ScientificArticle[]>(endpoint);
};

export const getMotivation = async (emotion: string): Promise<MotivationMessage> => {
  return fetchFromApi<MotivationMessage>(`/motivation?emotion=${encodeURIComponent(emotion)}`);
};

export const getChatResponse = async (chatRequest: ChatRequest): Promise<ChatResponse> => {
  return fetchFromApi<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(chatRequest),
  });
};

export const saveChatConversation = async (conversationData: ConversationData): Promise<void> => {
  return fetchFromApi<void>('/conversation', {
    method: 'POST',
    body: JSON.stringify(conversationData),
  });
};

export const getFeedPosts = async (): Promise<FeedPost[]> => {
  return fetchFromApi<FeedPost[]>('/feed/posts');
};

// Exporter les fonctions sous forme d'objet
const apiService = {
  checkBackendHealth,
  fetchFromApi,
  getEmotionalQuote,
  saveEmotionalEntry,
  getScientificArticles,
  getMotivation,
  getChatResponse,
  saveChatConversation,
  getFeedPosts
};

export default apiService;

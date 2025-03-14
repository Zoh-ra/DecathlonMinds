// Service pour enregistrer le parcours utilisateur et ses émotions
import { Mood } from '../types/feed';

interface UserJourneyEntry {
  timestamp: number;
  emotion: Mood | string;
  reason: string;
}

// Stockage local du parcours utilisateur
let userJourney: UserJourneyEntry[] = [];

// Ajouter une entrée au parcours utilisateur
export const addToUserJourney = (emotion: Mood | string, reason: string): void => {
  const entry: UserJourneyEntry = {
    timestamp: Date.now(),
    emotion,
    reason
  };
  
  userJourney.push(entry);
  
  // Enregistrer dans le localStorage
  try {
    const existingJourney = localStorage.getItem('userEmotionalJourney');
    const parsedJourney = existingJourney ? JSON.parse(existingJourney) : [];
    parsedJourney.push(entry);
    localStorage.setItem('userEmotionalJourney', JSON.stringify(parsedJourney));
    
    console.log('[UserJourney] Émotion et raison enregistrées :', { emotion, reason });
  } catch (error) {
    console.error('[UserJourney] Erreur lors de l\'enregistrement dans localStorage :', error);
  }
};

// Récupérer la dernière entrée du parcours utilisateur
export const getLatestUserJourneyEntry = (): UserJourneyEntry | null => {
  if (userJourney.length === 0) {
    // Essayer de récupérer depuis localStorage
    try {
      const storedJourney = localStorage.getItem('userEmotionalJourney');
      if (storedJourney) {
        const parsedJourney = JSON.parse(storedJourney) as UserJourneyEntry[];
        userJourney = parsedJourney;
      }
    } catch (error) {
      console.error('[UserJourney] Erreur lors de la récupération depuis localStorage :', error);
    }
  }
  
  return userJourney.length > 0 ? userJourney[userJourney.length - 1] : null;
};

// Convertir le nom d'émotion du chatbot vers le format attendu par l'API
export const convertEmotionToPlatformFormat = (chatbotEmotion: string): Mood => {
  // Mapping entre les émotions du chatbot et les valeurs acceptées par l'API
  const emotionMapping: Record<string, Mood> = {
    'HAPPY': 'HAPPY',
    'SAD': 'SAD',
    'ANGRY': 'ANGRY',
    'ANXIOUS': 'ANXIOUS',
    'TIRED': 'TIRED',
    'CALM': 'CALM',
    'EXCITED': 'EXCITED'
  };
  
  return emotionMapping[chatbotEmotion] || 'HAPPY';
};

// Utilitaire pour manipuler les données du profil utilisateur
interface UserProfile {
  userName: string;
  objectives: string[];
  barriers: string[];
  availableDay: string;
  preferredTime: string;
}

// Clé de stockage pour le localStorage
const USER_PROFILE_KEY = 'decathlonminds_user_profile';

// Sauvegarde le profil utilisateur
export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  }
};

// Récupère le profil utilisateur
export const getUserProfile = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const profileJson = localStorage.getItem(USER_PROFILE_KEY);
    
    if (profileJson) {
      try {
        return JSON.parse(profileJson) as UserProfile;
      } catch (e) {
        console.error('Erreur lors de la récupération du profil utilisateur:', e);
      }
    }
  }
  
  return null;
};

// Sauvegarde uniquement le nom d'utilisateur
export const saveUserName = (name: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userName', name);
  }
};

// Récupère le nom d'utilisateur
export const getUserName = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userName') || '';
  }
  return '';
};

// Efface les données du profil utilisateur
export const clearUserProfile = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_PROFILE_KEY);
  }
};

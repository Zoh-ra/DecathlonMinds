'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

export default function MotivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emotion = searchParams.get('emotion');
  const cause = searchParams.get('cause');
  
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [textColor, setTextColor] = useState('#FFFFFF');

  useEffect(() => {
    async function fetchMotivationalQuote() {
      try {
        const response = await fetch('/api/motivation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emotion,
            cause,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch motivational quote');
        }

        const data = await response.json();
        setQuote(data.quote);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setQuote('Votre force intérieure est prête à conquérir tous les défis !');
        setLoading(false);
      }
    }

    fetchMotivationalQuote();
  }, [emotion, cause]);

  const handleBackClick = () => {
    router.push('/today');
  };
  
  // Correspondance exacte avec les couleurs définies dans TodayPage
  const getEmotionColor = () => {
    if (!emotion) return "#7B68EE"; // Couleur par défaut
    
    const emotionColors: Record<string, string> = {
      "Heureux(se)": "#FFD700", // Jaune doré
      "Joyeux(se)": "#FF8C00", // Orange vif
      "Excité(e)": "#FF4500", // Rouge-orangé
      "Satisfait(e)": "#9ACD32", // Vert jaune
      "Confiant(e)": "#32CD32", // Vert lime
      "Triste": "#FFB6C1", // Rose clair
      "Mélancolique": "#FFC0CB", // Rose
      "Déçu(e)": "#FFFFE0", // Jaune pâle
      "En colère": "#E0FFFF", // Cyan clair
      "Frustré(e)": "#F0FFF0", // Vert menthe
      "Anxieux(se)": "#FFF8DC", // Blanc-crème
      "Énervé(e)": "#FF4500", // Rouge-orangé
    };
    
    return emotionColors[emotion] || "#7B68EE";
  };

  // Fonction pour déterminer si une couleur est claire
  const isLightColor = (color: string) => {
    // Convertir la couleur hexadécimale en RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calcul de la luminosité (formule standard)
    // Plus la valeur est élevée, plus la couleur est claire
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.6; // Seuil pour déterminer si la couleur est claire
  };

  const getBackgroundStyle = () => {
    const emotionColor = getEmotionColor();
    
    // Définir la couleur du texte en fonction de la luminosité du fond
    setTimeout(() => {
      setTextColor(isLightColor(emotionColor) ? '#191970' : '#FFFFFF');
    }, 0);
    
    return {
      background: `linear-gradient(to bottom right, ${emotionColor}, #180533)`,
    };
  };

  const getTextStyle = () => {
    return {
      color: textColor,
      textShadow: textColor === '#FFFFFF' 
        ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
        : '0 1px 2px rgba(0, 0, 0, 0.1)'
    };
  };

  const getContainerStyle = () => {
    return {
      backgroundColor: textColor === '#FFFFFF' 
        ? 'rgba(0, 0, 0, 0.15)'
        : 'rgba(255, 255, 255, 0.2)'
    };
  };

  return (
    <div className={styles.container} style={getBackgroundStyle()}>
      <div className={styles.header}>
        <button onClick={handleBackClick} className={styles.backButton} aria-label="Retour">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className={styles.quoteContainer} style={getContainerStyle()}>
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <p className={styles.quote} style={getTextStyle()}>{quote}</p>
        )}
      </div>
    </div>
  );
}

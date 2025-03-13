'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Chatbot from '../../components/Chatbot/Chatbot';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TodayPage() {
  const [showChat, setShowChat] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const router = useRouter();

  // Couleurs pour le mode sombre (existantes)
  const darkModeColors = [
    { icon: '😊', text: 'Heureux(se)', emotion: 'HAPPY', color: '#FFD700' }, // Jaune doré
    { icon: '🥳', text: 'Joyeux(se)', emotion: 'JOYFUL', color: '#FF8C00' }, // Orange vif
    { icon: '😃', text: 'Excité(e)', emotion: 'EXCITED', color: '#FF4500' }, // Rouge-orangé
    { icon: '😌', text: 'Satisfait(e)', emotion: 'SATISFIED', color: '#9ACD32' }, // Vert jaune
    { icon: '😎', text: 'Confiant(e)', emotion: 'CONFIDENT', color: '#32CD32' }, // Vert lime
    { icon: '😔', text: 'Triste', emotion: 'SAD', color: '#FFB6C1' }, // Rose clair (contraire)
    { icon: '😔', text: 'Mélancolique', emotion: 'MELANCHOLIC', color: '#FFC0CB' }, // Rose (contraire)
    { icon: '😞', text: 'Déçu(e)', emotion: 'DISAPPOINTED', color: '#FFFFE0' }, // Jaune pâle (contraire)
    { icon: '😡', text: 'En colère', emotion: 'ANGRY', color: '#E0FFFF' }, // Cyan clair (contraire)
    { icon: '😤', text: 'Frustré(e)', emotion: 'FRUSTRATED', color: '#F0FFF0' }, // Vert menthe (contraire)
    { icon: '😰', text: 'Anxieux(se)', emotion: 'ANXIOUS', color: '#FFF8DC' }, // Blanc-crème (contraire)
  ];

  // Couleurs plus vives pour le mode jour
  const lightModeColors = [
    { icon: '😊', text: 'Heureux(se)', emotion: 'HAPPY', color: '#FFDD00' }, // Jaune éclatant
    { icon: '🥳', text: 'Joyeux(se)', emotion: 'JOYFUL', color: '#FF6F00' }, // Orange intense
    { icon: '😃', text: 'Excité(e)', emotion: 'EXCITED', color: '#FF3D00' }, // Rouge vif
    { icon: '😌', text: 'Satisfait(e)', emotion: 'SATISFIED', color: '#76FF03' }, // Vert fluo
    { icon: '😎', text: 'Confiant(e)', emotion: 'CONFIDENT', color: '#00E676' }, // Vert émeraude vif
    { icon: '😔', text: 'Triste', emotion: 'SAD', color: '#FF80AB' }, // Rose vif
    { icon: '😔', text: 'Mélancolique', emotion: 'MELANCHOLIC', color: '#FF4081' }, // Rose fuchsia
    { icon: '😞', text: 'Déçu(e)', emotion: 'DISAPPOINTED', color: '#FFFF00' }, // Jaune citron
    { icon: '😡', text: 'En colère', emotion: 'ANGRY', color: '#18FFFF' }, // Cyan électrique
    { icon: '😤', text: 'Frustré(e)', emotion: 'FRUSTRATED', color: '#1DE9B6' }, // Turquoise vif
    { icon: '😰', text: 'Anxieux(se)', emotion: 'ANXIOUS', color: '#FFECB3' }, // Ambre clair
  ];

  // Choisir la palette de couleurs en fonction du mode
  const emotions = darkMode ? darkModeColors : lightModeColors;

  // Répartir les émotions sur deux lignes de manière égale
  const firstRowCount = Math.ceil(emotions.length / 2);
  const emotionsRow1 = emotions.slice(0, firstRowCount);
  const emotionsRow2 = emotions.slice(firstRowCount);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Activer le défilement horizontal par glissement sur mobile
    const enableHorizontalScroll = () => {
      const scrollers = document.querySelectorAll('.suggestionsScroller');
      
      scrollers.forEach(scroller => {
        if (scroller instanceof HTMLElement) {
          let isDown = false;
          let startX: number = 0;
          let scrollLeft: number = 0;

          scroller.addEventListener('mousedown', (e: MouseEvent) => {
            isDown = true;
            scroller.style.cursor = 'grabbing';
            startX = e.pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
          });

          scroller.addEventListener('mouseleave', () => {
            isDown = false;
            scroller.style.cursor = 'grab';
          });

          scroller.addEventListener('mouseup', () => {
            isDown = false;
            scroller.style.cursor = 'grab';
          });

          scroller.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scroller.offsetLeft;
            const walk = (x - startX) * 2; // Vitesse de défilement
            scroller.scrollLeft = scrollLeft - walk;
          });
          
          // Permettre le défilement horizontal avec la molette de la souris
          scroller.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            scroller.scrollLeft += e.deltaY;
          });
        }
      });
    };

    // Appliquer le défilement horizontal
    setTimeout(enableHorizontalScroll, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Fonction pour supprimer toute bordure violette
    const removePurpleBorders = () => {
      // Cibler tous les éléments qui pourraient avoir une bordure
      document.querySelectorAll('main, div, .chatbot, .chatbotContainer').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.border = 'none';
          el.style.outline = 'none';
          el.style.boxShadow = 'none';
        }
      });
    };
    
    // Exécuter après le rendu
    if (showChat) {
      setTimeout(removePurpleBorders, 0);
    }
  }, [showChat]);

  const handleEmotionClick = (emotion: string, color: string) => {
    setSelectedSuggestion(`Je me sens ${emotion}`);
    setSelectedEmotion(color);
    setSelectedColor(color);
    
    // Stocker l'émotion et sa couleur dans localStorage
    localStorage.setItem('selectedEmotion', emotion);
    localStorage.setItem('selectedEmotionColor', color);
    
    setShowChat(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={styles.pageContainer} 
      style={{ 
        background: selectedEmotion && selectedColor ? 
          `linear-gradient(135deg, ${selectedColor}30 0%, #180533 100%)` : 
          'linear-gradient(135deg, #300e5f 0%, #180533 100%)',
        color: darkMode ? 'white' : '#333'
      }}
    >
      <div className={`${styles.mainContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
        <div className={styles.contentWrapper} style={{ height: 'auto', overflow: 'hidden', maxHeight: '100vh' }}>
          <main className={`${styles.main} ${!darkMode ? styles.lightMode : ''}`}>
            <div className={styles.container} style={{ borderColor: 'transparent' }}>
              {!showChat ? (
                <>
                  <div className={styles.header}>
                    <button className={styles.themeButton} aria-label="Theme" onClick={toggleDarkMode}>
                      {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5"></circle>
                          <line x1="12" y1="1" x2="12" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="23"></line>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                          <line x1="1" y1="12" x2="3" y2="12"></line>
                          <line x1="21" y1="12" x2="23" y2="12"></line>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className={styles.assistantContainer}>
                    <Image 
                      src="/images/logo/Logo.png" 
                      alt="Décathlon Minds Logo" 
                      width={180} 
                      height={180} 
                      style={{ objectFit: 'contain' }} 
                    />
                    <h1 className={styles.assistantText}>Bonjour, je suis <span style={{ fontWeight: 'bold' }}>Décathlon</span>Minds</h1>
                    <p className={styles.assistantSubtext}>Comment puis-je vous aider aujourd&apos;hui ?</p>
                  </div>

                  <div className={styles.welcomeMessage}>
                    <div className={styles.welcomeIcon}>✨</div>
                    <h2>Votre compagnon sportif et émotionnel</h2>
                    <p>Je suis là pour vous accompagner et vous motiver dans votre parcours sportif. Partagez vos émotions, trouvez votre motivation et atteignez vos objectifs avec mon aide.</p>
                  </div>

                  {/* Container des suggestions avec défilement horizontal */}
                  <div className={styles.suggestionsContainer}>
                    <div className={styles.suggestionsScroller} id="scroller">
                      <div className={styles.suggestionsContent}>
                        {/* Première rangée d'émotions */}
                        <div className={styles.suggestionRow}>
                          {emotionsRow1.map((emotion, index) => (
                            <button
                              key={`emotion-1-${index}`}
                              className={styles.suggestionButton}
                              onClick={() => handleEmotionClick(emotion.text, emotion.color)}
                              style={{ 
                                background: darkMode 
                                  ? `linear-gradient(135deg, rgba(25, 18, 40, 0.75), ${emotion.color}40)` 
                                  : `linear-gradient(135deg, rgba(255, 255, 255, 0.9), ${emotion.color}80)`,
                                borderColor: darkMode 
                                  ? `${emotion.color}60` 
                                  : `${emotion.color}90` 
                              }}
                            >
                              <span className={styles.suggestionEmoji}>{emotion.icon}</span>
                              <span>{emotion.text}</span>
                            </button>
                          ))}
                        </div>
                        
                        {/* Deuxième rangée d'émotions */}
                        <div className={styles.suggestionRow}>
                          {emotionsRow2.map((emotion, index) => (
                            <button
                              key={`emotion-2-${index}`}
                              className={styles.suggestionButton}
                              onClick={() => handleEmotionClick(emotion.text, emotion.color)}
                              style={{ 
                                background: darkMode 
                                  ? `linear-gradient(135deg, rgba(25, 18, 40, 0.75), ${emotion.color}40)` 
                                  : `linear-gradient(135deg, rgba(255, 255, 255, 0.9), ${emotion.color}80)`,
                                borderColor: darkMode 
                                  ? `${emotion.color}60` 
                                  : `${emotion.color}90` 
                              }}
                            >
                              <span className={styles.suggestionEmoji}>{emotion.icon}</span>
                              <span>{emotion.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div 
                  className={styles.chatbotContainer} 
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    background: 'transparent',
                    padding: 0,
                    margin: 0
                  }}
                >
                  <Chatbot
                    initialMessage={selectedSuggestion}
                    onBack={() => setShowChat(false)}
                    emotionColor={selectedEmotion}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

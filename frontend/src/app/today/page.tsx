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
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Couleurs pour le mode sombre (existantes)
  const darkModeColors = [
    { text: "Heureux(se)", icon: "😊", emotion: "HAPPY", color: "#FFD700" }, // Jaune doré
    { text: "Joyeux(se)", icon: "🥳", emotion: "JOYFUL", color: "#FF8C00" }, // Orange vif
    { text: "Excité(e)", icon: "😃", emotion: "EXCITED", color: "#FF4500" }, // Rouge-orangé
    { text: "Satisfait(e)", icon: "😌", emotion: "SATISFIED", color: "#9ACD32" }, // Vert jaune
    { text: "Confiant(e)", icon: "😎", emotion: "CONFIDENT", color: "#32CD32" }, // Vert lime
    { text: "Triste", icon: "😔", emotion: "SAD", color: "#FFB6C1" }, // Rose clair (contraire)
    { text: "Mélancolique", icon: "😔", emotion: "MELANCHOLIC", color: "#FFC0CB" }, // Rose (contraire)
    { text: "Déçu(e)", icon: "😞", emotion: "DISAPPOINTED", color: "#FFFFE0" }, // Jaune pâle (contraire)
    { text: "En colère", icon: "😡", emotion: "ANGRY", color: "#E0FFFF" }, // Cyan clair (contraire)
    { text: "Frustré(e)", icon: "😤", emotion: "FRUSTRATED", color: "#F0FFF0" }, // Vert menthe (contraire)
    { text: "Anxieux(se)", icon: "😰", emotion: "ANXIOUS", color: "#FFF8DC" }, // Blanc-crème (contraire)
  ];

  // Couleurs plus vives pour le mode jour
  const lightModeColors = [
    { text: "Heureux(se)", icon: "😊", emotion: "HAPPY", color: "#FFDD00" }, // Jaune éclatant
    { text: "Joyeux(se)", icon: "🥳", emotion: "JOYFUL", color: "#FF6F00" }, // Orange intense
    { text: "Excité(e)", icon: "😃", emotion: "EXCITED", color: "#FF3D00" }, // Rouge vif
    { text: "Satisfait(e)", icon: "😌", emotion: "SATISFIED", color: "#76FF03" }, // Vert fluo
    { text: "Confiant(e)", icon: "😎", emotion: "CONFIDENT", color: "#00E676" }, // Vert émeraude vif
    { text: "Triste", icon: "😔", emotion: "SAD", color: "#FF80AB" }, // Rose vif
    { text: "Mélancolique", icon: "😔", emotion: "MELANCHOLIC", color: "#FF4081" }, // Rose fuchsia
    { text: "Déçu(e)", icon: "😞", emotion: "DISAPPOINTED", color: "#FFFF00" }, // Jaune citron
    { text: "En colère", icon: "😡", emotion: "ANGRY", color: "#18FFFF" }, // Cyan électrique
    { text: "Frustré(e)", icon: "😤", emotion: "FRUSTRATED", color: "#1DE9B6" }, // Turquoise vif
    { text: "Anxieux(se)", icon: "😰", emotion: "ANXIOUS", color: "#FFECB3" }, // Ambre clair
  ];

  // Choisir la palette de couleurs en fonction du mode
  const emotions = darkMode ? darkModeColors : lightModeColors;

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
      <main className={`${styles.main} ${!darkMode ? styles.lightMode : ''}`}>
        <div className={styles.container} style={{ borderColor: 'transparent' }}>
          {!showChat ? (
            <>
              <div className={styles.header}>
                <button className={styles.menuButton} aria-label="Menu" onClick={toggleMenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
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

              {menuOpen && (
                <div className={styles.menu}>
                  <div className={styles.menuHeader}>
                    <button className={styles.closeButton} onClick={toggleMenu}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <h3>Menu</h3>
                  </div>
                  <ul className={styles.menuList}>
                    <li>
                      <button 
                        onClick={() => {
                          toggleMenu();
                          setShowChat(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Accueil
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          toggleMenu();
                          setShowChat(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Today
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          toggleMenu();
                          router.push('/feed');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="M12 3v18"></path>
                          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                          <path d="M3 9h18"></path>
                          <path d="M3 15h18"></path>
                          <path d="M9 9v13"></path>
                          <path d="M15 9v13"></path>
                        </svg>
                        Journal
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mon Profil
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="M3 3v18h18"></path>
                          <path d="m19 9-5 5-4-4-3 3"></path>
                        </svg>
                        Historique
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Paramètres
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            <div className={styles.assistantContainer}>
              <div className={styles.assistantIcon}>
                <Image 
                  src="/images/logo/Logo.png" 
                  alt="Décathlon Minds Logo" 
                  width={120} 
                  height={120} 
                  style={{ objectFit: 'contain' }} 
                />
              </div>
              <h1 className={styles.assistantText}>Bonjour, je suis <span style={{ fontWeight: 'bold' }}>Décathlon</span>Minds</h1>
              <p className={styles.assistantSubtext}>Comment puis-je vous aider aujourd&apos;hui ?</p>
            </div>

            <div className={styles.suggestionsContainer}>
              {emotions.map((emotion, index) => (
                <button
                  key={index}
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
                  <div className={styles.suggestionIcon} style={{ 
                    background: darkMode 
                      ? `${emotion.color}30` 
                      : `${emotion.color}40`,
                    color: emotion.color,
                    fontWeight: darkMode ? 'normal' : 'bold'
                  }}>
                    {emotion.icon}
                  </div>
                  {emotion.text}
                </button>
              ))}
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
  );
}

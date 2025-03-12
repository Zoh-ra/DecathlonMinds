'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Chatbot from '../../components/Chatbot/Chatbot';

export default function TodayPage() {
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');

  // Suppression du timer automatique qui lançait le chat
  // L'utilisateur doit maintenant explicitement démarrer le chat

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setShowChat(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Remplacer les suggestions par les émotions
  const emotions = [
    { text: "Heureux(se)", icon: "😊", emotion: "HAPPY" },
    { text: "Triste", icon: "😔", emotion: "SAD" },
    { text: "En colère", icon: "😠", emotion: "ANGRY" },
    { text: "Anxieux(se)", icon: "😰", emotion: "ANXIOUS" },
    { text: "Fatigué(e)", icon: "😴", emotion: "TIRED" },
  ];

  // Fonction pour gérer l'envoi de message via le champ texte
  const handleSendInputMessage = () => {
    if (inputValue.trim()) {
      setSelectedSuggestion(inputValue);
      setShowChat(true);
    }
  };

  return (
    <main className={`${styles.main} ${!darkMode ? styles.lightMode : ''}`}>
      <div className={styles.container}>
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
                      Today
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={toggleMenu}
                    >
                      Mon Profil
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={toggleMenu}
                    >
                      Historique
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={toggleMenu}
                    >
                      Paramètres
                    </button>
                  </li>
                </ul>
              </div>
            )}

            <div className={styles.assistantContainer}>
              <div className={styles.assistantIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a370f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v8"></path>
                  <path d="M18.4 12a6.4 6.4 0 1 1-12.8 0 6.4 6.4 0 0 1 12.8 0Z"></path>
                  <path d="M19 16v6"></path>
                  <path d="M5 16v6"></path>
                  <path d="M12 22v-4"></path>
                </svg>
              </div>
              <h1 className={styles.assistantText}>Bonjour, je suis <span style={{ fontWeight: 'bold' }}>Décathlon</span>Minds</h1>
              <p className={styles.assistantSubtext}>Comment puis-je vous aider aujourd'hui ?</p>
            </div>

            <div className={styles.suggestionsContainer}>
              {emotions.map((emotion, index) => (
                <button 
                  key={index}
                  className={styles.suggestionButton} 
                  onClick={() => handleSuggestionClick(`Je me sens ${emotion.text}`)}
                >
                  <span className={styles.suggestionIcon}>{emotion.icon}</span>
                  {emotion.text}
                </button>
              ))}
            </div>

            {/* Suppression du conteneur de mode avec les boutons Assistant et Recherche */}

            <div className={styles.inputContainer}>
              <input 
                type="text" 
                className={styles.inputBar} 
                placeholder="Message DécathlonMinds..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    handleSendInputMessage();
                  }
                }}
              />
              <button className={styles.sendButton} onClick={handleSendInputMessage} aria-label="Envoyer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 3 3 9-3 9 19-9Z"></path>
                  <path d="M6 12h16"></path>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className={styles.chatbotContainer}>
            <Chatbot initialMessage={selectedSuggestion || inputValue} />
          </div>
        )}
      </div>
    </main>
  );
}

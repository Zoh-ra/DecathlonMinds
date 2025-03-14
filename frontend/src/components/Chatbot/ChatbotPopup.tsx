'use client';

import { useState, useRef } from 'react';
import styles from './ChatbotPopup.module.css';
import Chatbot from './Chatbot';

interface ChatbotPopupProps {
  emotionColor?: string;
}

const ChatbotPopup: React.FC<ChatbotPopupProps> = ({ emotionColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le chatbot */}
      <button 
        className={styles.chatButton} 
        onClick={toggleChatbot}
        aria-label="Ouvrir le chat myMind"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <span className={styles.chatButtonText}>myMind</span>
          </>
        )}
      </button>

      {/* Popup du chatbot */}
      {isOpen && (
        <div className={styles.chatbotPopupContainer} ref={popupRef}>
          <div className={styles.chatbotPopup}>
            <Chatbot 
              onBack={handleClose}
              emotionColor={emotionColor || '#4A90E2'}
            />
          </div>
        </div>
      )}

      {/* Notification pour inciter à ouvrir le chat (optionnel) */}
      {!isOpen && !hasBeenOpened && (
        <div className={styles.chatNotification} onClick={toggleChatbot}>
          <p>Comment vous sentez-vous aujourd&apos;hui ?</p>
          <div className={styles.pulseRing}></div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;

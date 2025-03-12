'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// États du chat : initial, sélection d'émotion, sélection de cause, affichage de la réponse
type ChatStateType = 'initial' | 'selecting_emotion' | 'selecting_reason' | 'chat';

const Chatbot: React.FC<{ initialMessage?: string }> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState<ChatStateType>('initial');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  
  // Liste des émotions disponibles
  const emotions = [
    { text: "Heureux(se)", icon: "😊", emotion: "HAPPY" },
    { text: "Triste", icon: "😔", emotion: "SAD" },
    { text: "En colère", icon: "😠", emotion: "ANGRY" },
    { text: "Anxieux(se)", icon: "😰", emotion: "ANXIOUS" },
    { text: "Fatigué(e)", icon: "😴", emotion: "TIRED" },
    { text: "Surpris(e)", icon: "😮", emotion: "SURPRISED" },
    { text: "Calme", icon: "😌", emotion: "CALM" },
    { text: "Excité(e)", icon: "🤩", emotion: "EXCITED" },
  ];
  
  // Causes possibles par émojis
  const emotionCauses = [
    { emoji: "🏃", label: "Sport", cause: "sport" },
    { emoji: "👨‍👩‍👧‍👦", label: "Famille", cause: "famille" },
    { emoji: "💼", label: "Travail", cause: "travail" },
    { emoji: "💔", label: "Relation", cause: "relation" },
    { emoji: "🏠", label: "Maison", cause: "maison" },
    { emoji: "💰", label: "Finances", cause: "finances" },
    { emoji: "🧠", label: "Mental", cause: "mental" },
    { emoji: "🤔", label: "Autre", cause: "autre" },
  ];

  // Fonction pour générer un ID unique pour les messages
  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialisation du chat
  useEffect(() => {
    if (initialMessage && initialMessage.startsWith("Je me sens ")) {
      // Cas où on arrive avec une émotion sélectionnée (depuis le bouton de la page Today)
      const emotion = initialMessage.replace("Je me sens ", "");
      setSelectedEmotion(emotion);
      
      // Afficher le message de l'utilisateur
      const userMessageId = generateUniqueId('user');
      setMessages([{
        id: userMessageId,
        text: initialMessage,
        sender: 'user',
      }]);
      
      // Passer à la sélection de la cause
      setChatState('selecting_reason');
    } else if (messages.length === 0) {
      // Message de bienvenue et invitation à sélectionner une émotion
      setMessages([{
        id: generateUniqueId('bot'),
        text: "Bonjour ! Je suis DécathlonMinds, votre compagnon bien-être. Comment vous sentez-vous aujourd'hui ?",
        sender: 'bot',
      }]);
      
      // Afficher les émojis d'émotions
      setChatState('selecting_emotion');
    }
  }, [initialMessage, messages.length]);

  // Scroll vers le bas à chaque changement de messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fonction pour gérer la sélection d'une émotion
  const handleEmotionSelection = (emotion: string, emotionName: string) => {
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, {
      id: generateUniqueId('user'),
      text: `Je me sens ${emotionName}`,
      sender: 'user',
    }]);
    
    // Enregistrer l'émotion et passer à la sélection de cause
    setSelectedEmotion(emotionName);
    setChatState('selecting_reason');
  };

  // Fonction pour gérer la sélection d'une cause
  const handleCauseSelection = (cause: string) => {
    // Ajouter le message de sélection de cause
    setMessages(prev => [...prev, {
      id: generateUniqueId('user'),
      text: `La cause est ${cause}`,
      sender: 'user',
    }]);
    
    // Afficher l'indicateur de chargement
    setIsTyping(true);
    
    // Obtenir une citation adaptée à l'émotion et à la cause
    fetchReassuranceQuote(selectedEmotion, cause);
  };

  // Fonction pour obtenir une citation rassurante
  const fetchReassuranceQuote = async (emotion: string, reason: string) => {
    try {
      const response = await fetch('/api/emotion/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion, reason }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ajouter la citation aux messages
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: generateUniqueId('bot'),
          text: data.quote,
          sender: 'bot',
        },
      ]);
      
      // Préparer pour un nouveau cycle d'interactions
      setChatState('selecting_emotion');
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: generateUniqueId('bot'),
          text: "Désolé, je n'ai pas pu obtenir une citation adaptée à votre situation. Comment vous sentez-vous maintenant ?",
          sender: 'bot',
        },
      ]);
      setChatState('selecting_emotion');
    }
  };

  return (
    <div className={styles.chatbot}>
      <div className={styles.messagesContainer}>
        {/* Affichage des messages */}
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`${styles.messageContainer} ${
              message.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
            }`}
          >
            <div
              className={`${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Affichage des émojis d'émotion */}
        {chatState === 'selecting_emotion' && (
          <div className={styles.emojiCauseContainer}>
            {emotions.map((item, index) => (
              <div key={index} className={styles.emojiWrapper}>
                <button 
                  className={styles.emojiCauseButton}
                  onClick={() => handleEmotionSelection(item.emotion, item.text)}
                >
                  {item.icon}
                </button>
                <div className={styles.emojiLabel}>{item.text}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Affichage des émojis de cause */}
        {chatState === 'selecting_reason' && (
          <div className={styles.emojiCauseContainer}>
            {emotionCauses.map((item, index) => (
              <div key={index} className={styles.emojiWrapper}>
                <button 
                  className={styles.emojiCauseButton}
                  onClick={() => handleCauseSelection(item.cause)}
                >
                  {item.emoji}
                </button>
                <div className={styles.emojiLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Indicateur de chargement */}
        {isTyping && (
          <div className={styles.messageContainer}>
            <div className={styles.botMessage}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chatbot;

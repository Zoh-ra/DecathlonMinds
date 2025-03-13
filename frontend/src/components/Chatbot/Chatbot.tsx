'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// États du chat : initial, sélection d'émotion, sélection de cause, affichage de la réponse
type ChatStateType = 'initial' | 'selecting_emotion' | 'selecting_reason' | 'chat';

interface ChatbotProps {
  initialMessage?: string;
  onBack?: () => void;
  onClose?: () => void;
  emotionColor?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialMessage, onBack, onClose, emotionColor }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState<ChatStateType>('initial');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [inputValue, setInputValue] = useState('');

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
  const handleCauseSelection = (cause: string, label: string) => {
    // Rediriger vers la page de motivation avec les paramètres d'émotion et de cause
    router.push(`/motivation?emotion=${encodeURIComponent(selectedEmotion)}&cause=${encodeURIComponent(cause)}&label=${encodeURIComponent(label)}`);
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

  const formatMessage = (message: string) => {
    // Formatage des liens dans les messages
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  const getBotMessageStyle = () => {
    if (emotionColor) {
      return {
        backgroundColor: `${emotionColor}80`,
        borderColor: emotionColor,
        boxShadow: `0 1px 8px ${emotionColor}40`
      };
    }
    return {};
  };

  const getEmojiBgStyle = () => {
    if (emotionColor) {
      return {
        backgroundColor: `rgba(255, 255, 255, 0.2)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid rgba(255, 255, 255, 0.3)`,
        boxShadow: `0 4px 15px rgba(0, 0, 0, 0.15)`,
        color: 'white'
      };
    }
    return {
      backgroundColor: `rgba(255, 255, 255, 0.2)`,
      backdropFilter: 'blur(8px)',
      border: `1px solid rgba(255, 255, 255, 0.3)`,
      boxShadow: `0 4px 15px rgba(0, 0, 0, 0.15)`,
      color: 'white'
    };
  };

  const getEmojiContainerStyle = () => {
    if (emotionColor) {
      return {
        backgroundColor: 'transparent',
        border: 'none'
      };
    }
    return {
      backgroundColor: 'transparent',
      border: 'none'
    };
  };

  const getButtonStyle = () => {
    if (emotionColor) {
      return {
        backgroundColor: `${emotionColor}50`,
        borderColor: emotionColor,
        color: 'white'
      };
    }
    return {};
  };

  return (
    <div 
      className={styles.chatbot} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        zIndex: 1000,
        margin: 0,
        padding: 0,
        background: emotionColor 
          ? `linear-gradient(135deg, ${emotionColor} 0%, #180533 100%)` 
          : 'linear-gradient(135deg, #300e5f 0%, #180533 100%)'
      }}
    >
      <div className={styles.chatHeader}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
          aria-label="Retour à l'écran d'accueil"
        >
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
      <div className={styles.messagesContainer}>
        {/* Affichage des messages */}
        {messages.map((message, index) => (
          <div key={index} className={styles.messageContainer}>
            <div
              className={`${styles.message} ${
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              }`}
              style={message.sender !== 'user' ? getBotMessageStyle() : {}}
              dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
            ></div>
          </div>
        ))}
        
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
      
      {/* Affichage des options d'émotions et causes tout en bas */}
      {(chatState === 'selecting_emotion' || chatState === 'selecting_reason') && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100%',
          padding: '25px 0 15px',
          zIndex: 10
        }}>
          {chatState === 'selecting_emotion' && (
            <div className="twoRowsGrid" style={{ width: '100%' }}>
              <div className="twoRowsRow">
                {emotions.slice(0, Math.ceil(emotions.length / 2)).map((emotion, index) => (
                  <button
                    key={index}
                    className="pillCard"
                    onClick={() => handleEmotionSelection(emotion.emotion, emotion.text)}
                  >
                    <span style={{ marginRight: '8px' }}>{emotion.icon}</span>
                    {emotion.text}
                  </button>
                ))}
              </div>
              <div className="twoRowsRow">
                {emotions.slice(Math.ceil(emotions.length / 2)).map((emotion, index) => (
                  <button
                    key={index + Math.ceil(emotions.length / 2)}
                    className="pillCard"
                    onClick={() => handleEmotionSelection(emotion.emotion, emotion.text)}
                  >
                    <span style={{ marginRight: '8px' }}>{emotion.icon}</span>
                    {emotion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {chatState === 'selecting_reason' && (
            <div className="twoRowsGrid" style={{ width: '100%' }}>
              <div className="twoRowsRow">
                {emotionCauses.slice(0, Math.ceil(emotionCauses.length / 2)).map((cause, index) => (
                  <button
                    key={index}
                    className="pillCard"
                    onClick={() => handleCauseSelection(cause.cause, cause.label)}
                  >
                    <span style={{ marginRight: '8px' }}>{cause.emoji}</span>
                    {cause.label}
                  </button>
                ))}
              </div>
              <div className="twoRowsRow">
                {emotionCauses.slice(Math.ceil(emotionCauses.length / 2)).map((cause, index) => (
                  <button
                    key={index + Math.ceil(emotionCauses.length / 2)}
                    className="pillCard"
                    onClick={() => handleCauseSelection(cause.cause, cause.label)}
                  >
                    <span style={{ marginRight: '8px' }}>{cause.emoji}</span>
                    {cause.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;

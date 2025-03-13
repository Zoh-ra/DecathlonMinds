'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

type ChatStateType = 'initial' | 'selecting_emotion' | 'selecting_reason' | 'chat';

interface ChatbotProps {
  initialMessage?: string;
  onBack?: () => void;
  emotionColor?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialMessage, onBack, emotionColor }) => {
  const router = useRouter();
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
    { text: "Calme", icon: "😌", emotion: "CALM" },
    { text: "Excité(e)", icon: "🤩", emotion: "EXCITED" },
  ];
  
  // Causes possibles
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

  // ID unique pour les messages
  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialisation du chat
  useEffect(() => {
    if (messages.length === 0) {
      if (initialMessage && initialMessage.startsWith("Je me sens ")) {
        const emotion = initialMessage.replace("Je me sens ", "");
        setSelectedEmotion(emotion);
        
        setMessages([{
          id: generateUniqueId('bot'),
          text: "Bonjour ! Je suis myMind, votre compagnon bien-être.",
          sender: 'bot' as const,
        }, {
          id: generateUniqueId('user'),
          text: initialMessage,
          sender: 'user' as const,
        }, {
          id: generateUniqueId('bot'),
          text: "Cette émotion est liée à quelle situation ?",
          sender: 'bot' as const,
        }]);
        
        setChatState('selecting_reason');
      } else {
        setMessages([{
          id: generateUniqueId('bot'),
          text: "Bonjour ! Je suis myMind, votre compagnon bien-être. Comment vous sentez-vous aujourd'hui ?",
          sender: 'bot' as const,
        }]);
        
        setChatState('selecting_emotion');
      }
    }
  }, [initialMessage, messages.length]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.parentElement;
      if (messagesContainer) {
        // Force le défilement vers le bas en conservant la position quand l'utilisateur fait défiler manuellement
        const isScrolledToBottom = messagesContainer.scrollHeight - messagesContainer.clientHeight <= messagesContainer.scrollTop + 100;
        
        if (isScrolledToBottom) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 100);
        }
      }
    }
  }, [messages]);

  // Sélection d'une émotion
  const handleEmotionSelection = (emotion: string, emotionName: string) => {
    const updatedMessages = [
      ...messages,
      {
        id: generateUniqueId('user'),
        text: `Je me sens ${emotionName}`,
        sender: 'user' as const,
      },
      {
        id: generateUniqueId('bot'),
        text: "Cette émotion est liée à quelle situation ?",
        sender: 'bot' as const,
      }
    ];
    
    setMessages(updatedMessages);
    setSelectedEmotion(emotionName);
    setChatState('selecting_reason');
  };

  // Obtenir une réponse adaptée à l'émotion et à la cause
  const getResponse = (emotion: string, cause: string): string => {
    // Si l'émotion est vide, retourner une réponse par défaut
    if (!emotion || emotion.trim() === '') {
      return "Je ne suis pas sûr de comprendre votre émotion. Une marche ou un jogging peuvent néanmoins être bénéfiques pour votre bien-être général.";
    }
    
    if (emotion === "Heureux(se)" || emotion === "Calme" || emotion === "Excité(e)") {
      if (cause === "sport") {
        return `C'est super de vous sentir ${emotion.toLowerCase()} ! Continuez sur cette lancée avec une marche ou un jogging de 15-20 minutes pour libérer encore plus d'endorphines.`;
      } else {
        return `C'est super de vous sentir ${emotion.toLowerCase()} ! Une marche ou un jogging peuvent vous aider à prolonger cet état de bien-être.`;
      }
    } 
    else if (emotion === "Triste") {
      if (cause === "relation" || cause === "famille") {
        return "Je comprends que la tristesse puisse être difficile. Une marche en plein air peut vous offrir un moment de recul et de perspective. 15 minutes d'activité douce stimuleront votre sérotonine.";
      } else {
        return "Je comprends que la tristesse puisse être difficile. Une marche douce de 15 minutes peut stimuler la sérotonine et améliorer votre humeur. Le mouvement est un excellent moyen de prendre soin de soi.";
      }
    } 
    else if (emotion === "En colère") {
      if (cause === "travail" || cause === "finances") {
        return "La colère est une émotion puissante qui peut être canalisée positivement. Un jogging énergique vous permettrait de libérer cette frustration et de retrouver une clarté d'esprit pour aborder vos défis.";
      } else {
        return "La colère est une émotion puissante qui peut être canalisée positivement. Un jogging énergique vous aiderait à libérer cette tension et à retrouver plus de clarté mentale.";
      }
    } 
    else if (emotion === "Anxieux(se)") {
      if (cause === "mental") {
        return "L'anxiété peut être apaisée par l'activité physique. Une marche en pleine conscience, où vous vous concentrez sur votre respiration et vos pas, peut réduire le niveau de cortisol et apaiser votre système nerveux.";
      } else {
        return "L'anxiété peut être apaisée par l'activité physique. Une marche en pleine conscience peut réduire le niveau de cortisol et vous aider à retrouver un sentiment de contrôle.";
      }
    } 
    else if (emotion === "Fatigué(e)") {
      if (cause === "maison" || cause === "travail") {
        return "La fatigue peut paradoxalement être combattue par une activité douce. Changer d'environnement avec une courte marche de 10 minutes peut revitaliser votre énergie bien plus efficacement qu'une pause café.";
      } else {
        return "La fatigue peut paradoxalement être combattue par une activité douce. Une courte marche de 10 minutes peut augmenter votre énergie plus efficacement qu'une pause café.";
      }
    } 
    
    // Réponse par défaut
    return "Je comprends votre sentiment. L'activité physique est un excellent moyen de prendre soin de votre santé mentale. Une marche ou un jogging peuvent vous aider à retrouver un équilibre émotionnel.";
  };

  // Sélection d'une cause
  const handleCauseSelection = (cause: string) => {
    // 1. Ajouter le message utilisateur
    const userMessage: Message = {
      id: generateUniqueId('user'),
      text: `Cette émotion est liée à : ${cause}`,
      sender: 'user' as const,
    };
    
    // 2. Générer la réponse
    const response = getResponse(selectedEmotion, cause);
    
    // 3. Créer le message de réponse du bot
    const botMessage: Message = {
      id: generateUniqueId('bot'),
      text: response,
      sender: 'bot' as const,
    };
    
    // 4. Mettre à jour les messages et simuler la frappe
    setIsTyping(true);
    setMessages(prev => [...prev, userMessage]);
    
    // 5. Afficher la réponse après un délai
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
      setChatState('chat');
    }, 1000);
  };

  // Redirection vers la page feed
  const handleStartJourney = () => {
    // Rechercher la cause dans les messages
    const lastCauseMessage = [...messages].reverse()
      .find(msg => msg.sender === 'user' && msg.text.startsWith('Cette émotion est liée à :'));
    
    // Extraire la cause du message
    let cause = '';
    if (lastCauseMessage) {
      cause = lastCauseMessage.text.replace('Cette émotion est liée à : ', '');
    }
    
    // Trouver la valeur de l'émotion (HAPPY, SAD, etc.)
    const emotionObject = emotions.find(e => e.text === selectedEmotion);
    const emotionCode = emotionObject ? emotionObject.emotion : '';
    
    // Rediriger vers la page feed avec les paramètres d'émotion et de cause
    router.push(`/feed?emotion=${emotionCode}&cause=${encodeURIComponent(cause)}`);
  };

  return (
    <div className={styles.chatbot} style={{
      background: emotionColor 
        ? `linear-gradient(135deg, ${emotionColor}70 0%, #180533 100%)` 
        : 'linear-gradient(135deg, rgba(48, 14, 95, 0.9) 0%, rgba(24, 5, 51, 0.9) 100%)'
    }}>
      {/* Glassmorphism Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '70px',
        overflow: 'hidden',
        zIndex: 100
      }}>
        {/* Effet de verre */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(48, 14, 95, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }} />
        
        {/* Flou (se trouve dans un div distinct pour une meilleure compatibilité) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }} />
        
        {/* Contenu du header */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          zIndex: 5
        }}>
          <button 
            onClick={onBack}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s all',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{
            marginLeft: '16px',
            fontSize: '24px',
            fontWeight: 600,
            color: 'white',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            myMind
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.chatMessages} style={{ marginTop: '70px' }}>
        {messages.map((message) => (
          <div
            key={`message-${message.id}`}
            className={message.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer}
          >
            <div 
              className={message.sender === 'user' ? styles.userMessage : styles.botMessage}
              style={{
                backgroundColor: message.sender === 'user' 
                  ? 'rgba(79, 86, 196, 0.85)' 
                  : 'rgba(255, 255, 255, 0.18)',
                borderBottomRightRadius: message.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: message.sender === 'user' ? '18px' : '4px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Indicateur de chargement */}
        {isTyping && (
          <div className={styles.botMessageContainer}>
            <div 
              className={styles.botMessage}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                borderBottomLeftRadius: '4px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Référence pour le défilement automatique */}
        <div ref={messagesEndRef} className={styles.messagesEndRef} />
      </div>

      {/* Options pour la sélection d'émotions */}
      {chatState === 'selecting_emotion' && (
        <div className={styles.optionsContainer}>
          <div className={styles.optionsRow}>
            {emotions.slice(0, 4).map((emotion) => (
              <button
                key={`emotion-${emotion.emotion}`}
                className={styles.optionButton}
                onClick={() => handleEmotionSelection(emotion.emotion, emotion.text)}
              >
                <span>{emotion.icon}</span>
                {emotion.text}
              </button>
            ))}
          </div>
          <div className={styles.optionsRow}>
            {emotions.slice(4).map((emotion) => (
              <button
                key={`emotion-${emotion.emotion}`}
                className={styles.optionButton}
                onClick={() => handleEmotionSelection(emotion.emotion, emotion.text)}
              >
                <span>{emotion.icon}</span>
                {emotion.text}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Options pour la sélection de raisons */}
      {chatState === 'selecting_reason' && (
        <div className={styles.optionsContainer}>
          <div className={styles.optionsRow}>
            {emotionCauses.slice(0, 4).map((cause) => (
              <button
                key={`cause-${cause.cause}`}
                className={styles.optionButton}
                onClick={() => handleCauseSelection(cause.cause)}
              >
                <span>{cause.emoji}</span>
                {cause.label}
              </button>
            ))}
          </div>
          <div className={styles.optionsRow}>
            {emotionCauses.slice(4).map((cause) => (
              <button
                key={`cause-${cause.cause}`}
                className={styles.optionButton}
                onClick={() => handleCauseSelection(cause.cause)}
              >
                <span>{cause.emoji}</span>
                {cause.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Bouton pour commencer le parcours */}
      {chatState === 'chat' && (
        <div className={styles.startButtonContainer}>
          <button 
            className={styles.startButton}
            onClick={handleStartJourney}
          >
            Commencer
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import EmotionSelector from './EmotionSelector';
import ReasonSelector from './ReasonSelector';

// Types
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isEmotionSelector?: boolean;
  isReasonSelector?: boolean;
  isFinalResponse?: boolean;
};

type EmotionType = {
  emoji: string;
  name: string;
  label: string;
};

type ReasonType = {
  emoji: string;
  name: string;
  label: string;
};

type ChatResponse = {
  emotion: string;
  reason: string;
  datetime: string;
};

// Emotions list with emojis
const emotions: EmotionType[] = [
  { emoji: '😊', name: 'HAPPY', label: 'Heureux(se)' },
  { emoji: '😔', name: 'SAD', label: 'Triste' },
  { emoji: '😡', name: 'ANGRY', label: 'En colère' },
  { emoji: '😰', name: 'ANXIOUS', label: 'Anxieux(se)' },
  { emoji: '😴', name: 'TIRED', label: 'Fatigué(e)' },
  { emoji: '🤔', name: 'CONFUSED', label: 'Confus(e)' },
  { emoji: '😌', name: 'RELAXED', label: 'Détendu(e)' },
  { emoji: '🥳', name: 'EXCITED', label: 'Excité(e)' },
];

// Reasons list with emojis
const reasons: ReasonType[] = [
  { emoji: '💼', name: 'WORK', label: 'Travail' },
  { emoji: '❤️', name: 'LOVE', label: 'Amour' },
  { emoji: '👤', name: 'SELF', label: 'Moi-même' },
  { emoji: '👪', name: 'FAMILY', label: 'Famille' },
  { emoji: '🫂', name: 'FRIENDS', label: 'Amis' },
  { emoji: '💰', name: 'MONEY', label: 'Argent' },
  { emoji: '🏥', name: 'HEALTH', label: 'Santé' },
  { emoji: '🌍', name: 'WORLD', label: 'Actualités' },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<'initial' | 'emotion_selected' | 'reason_selected' | 'chat'>('initial');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReasonType | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Start the conversation when component mounts
  useEffect(() => {
    // Introduce the chatbot
    setTimeout(() => {
      addBotMessage("Bonjour ! Je suis votre assistant Décathlon Minds.");
      setTimeout(() => {
        addBotMessage("Comment vous sentez-vous aujourd'hui ?", true);
      }, 500);
    }, 500);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to add a bot message
  const addBotMessage = (text: string, isEmotionSelector = false, isReasonSelector = false, isFinalResponse = false) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        text,
        sender: 'bot',
        isEmotionSelector,
        isReasonSelector,
        isFinalResponse
      },
    ]);
  };

  // Function to add a user message
  const addUserMessage = (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), text, sender: 'user' },
    ]);
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    setInput('');
    setIsTyping(true);
    
    // Process based on chat state
    if (chatState === 'chat') {
      // Call OpenAI for chat
      fetchChatResponse(input);
    }
  };

  // Handle emotion selection
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
    addUserMessage(`${emotion.emoji} ${emotion.label}`);
    setChatState('emotion_selected');
    
    // Save emotion to backend
    saveEmotionalEntry(emotion.name, null);
    
    // Ask about reasons
    setTimeout(() => {
      addBotMessage("Savez-vous ce qui vous procure cette émotion ?", false, true);
    }, 500);
  };

  // Handle reason selection
  const handleReasonSelect = (reason: ReasonType) => {
    setSelectedReason(reason);
    addUserMessage(`${reason.emoji} ${reason.label}`);
    setChatState('reason_selected');
    
    // Update emotional entry with reason
    saveEmotionalEntry(selectedEmotion?.name || '', reason.name);
    
    // Show appropriate reassuring quote based on emotion and reason
    setTimeout(() => {
      fetchReassuranceQuote(selectedEmotion?.name || '', reason.name);
    }, 500);
  };

  // Function to fetch reassuring quote
  const fetchReassuranceQuote = async (emotion: string, reason: string) => {
    setIsTyping(true);
    try {
      const response = await fetch('/api/emotion/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion, reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get quote');
      }
      
      const data = await response.json();
      addBotMessage(data.quote, false, false, true);
      
      // Move to chat state
      setTimeout(() => {
        addBotMessage("Comment puis-je vous aider davantage aujourd'hui ?");
        setChatState('chat');
      }, 1000);
      
    } catch (error) {
      addBotMessage("Je comprends ce que vous ressentez. N'hésitez pas à me parler si vous avez besoin de quelque chose.", false, false, true);
      setChatState('chat');
    } finally {
      setIsTyping(false);
    }
  };

  // Function to save emotional entry to backend
  const saveEmotionalEntry = async (emotion: string, reason: string | null) => {
    try {
      const payload: any = {
        emotionType: emotion,
        intensityLevel: 'MEDIUM', // Default intensity
        description: '',
        weatherData: ''
      };
      
      if (reason) {
        payload.triggers = reason;
      }
      
      await fetch('/api/emotion/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
    } catch (error) {
      console.error('Error saving emotional entry:', error);
    }
  };

  // Function to fetch chat response from OpenAI API
  const fetchChatResponse = async (userMessage: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          emotion: selectedEmotion?.name || '',
          reason: selectedReason?.name || ''
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from chat');
      }
      
      const data = await response.json();
      addBotMessage(data.response);
      
    } catch (error) {
      addBotMessage("Désolé, je n'ai pas pu traiter votre message. Pouvez-vous réessayer ?");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatbot}>
      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            }`}
          >
            {message.isEmotionSelector ? (
              <EmotionSelector
                emotions={emotions}
                onSelect={handleEmotionSelect}
              />
            ) : message.isReasonSelector ? (
              <ReasonSelector
                reasons={reasons}
                onSelect={handleReasonSelect}
              />
            ) : (
              <div className={styles.messageText}>{message.text}</div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.chatInput}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Écrivez votre message..."
          disabled={chatState !== 'chat' && chatState !== 'initial'}
        />
        <button onClick={handleSendMessage}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

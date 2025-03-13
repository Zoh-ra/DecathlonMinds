'use client';

import React from 'react';
import styles from './Chatbot.module.css';

type EmotionType = {
  emoji: string;
  name: string;
  label: string;
};

type EmotionSelectorProps = {
  emotions: EmotionType[];
  onSelect: (emotion: EmotionType) => void;
};

export default function EmotionSelector({ emotions, onSelect }: EmotionSelectorProps) {
  return (
    <div className={styles.emojiSelector}>
      <div className={styles.emojiGrid}>
        {emotions.map((emotion) => (
          <button
            key={emotion.name}
            className={styles.emojiButton}
            onClick={() => onSelect(emotion)}
            aria-label={emotion.label}
          >
            <span className={styles.emoji}>{emotion.emoji}</span>
            <span className={styles.emojiLabel}>{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

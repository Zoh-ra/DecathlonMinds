'use client';

import React from 'react';
import styles from './Chatbot.module.css';

type ReasonType = {
  emoji: string;
  name: string;
  label: string;
};

type ReasonSelectorProps = {
  reasons: ReasonType[];
  onSelect: (reason: ReasonType) => void;
};

export default function ReasonSelector({ reasons, onSelect }: ReasonSelectorProps) {
  return (
    <div className={styles.emojiSelector}>
      <div className={styles.emojiGrid}>
        {reasons.map((reason) => (
          <button
            key={reason.name}
            className={styles.emojiButton}
            onClick={() => onSelect(reason)}
            aria-label={reason.label}
          >
            <span className={styles.emoji}>{reason.emoji}</span>
            <span className={styles.emojiLabel}>{reason.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

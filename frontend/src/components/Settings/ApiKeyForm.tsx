'use client';

import { useState, useEffect } from 'react';
import { openAIService } from '@/services/openai-service';
import styles from './ApiKeyForm.module.css';

export default function ApiKeyForm() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Récupérer la clé API du localStorage au chargement
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('openai_api_key');
      if (storedApiKey) {
        setApiKey(storedApiKey);
        setIsSaved(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setIsError(true);
      return;
    }
    
    try {
      // Sauvegarder la clé API dans le service
      openAIService.setApiKey(apiKey.trim());
      setIsSaved(true);
      setIsError(false);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la clé API:', error);
      setIsError(true);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Configuration de l'API OpenAI</h3>
      <p className={styles.description}>
        Pour générer des posts personnalisés, vous devez fournir votre clé API OpenAI.
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.link}
        >
          Obtenir une clé API
        </a>
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="apiKey" className={styles.label}>
            Clé API OpenAI
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsError(false);
            }}
            placeholder="sk-..."
            className={styles.input}
          />
        </div>
        
        <button type="submit" className={styles.button}>
          Enregistrer
        </button>
        
        {isSaved && (
          <p className={styles.successMessage}>
            Clé API enregistrée avec succès !
          </p>
        )}
        
        {isError && (
          <p className={styles.errorMessage}>
            Veuillez entrer une clé API valide.
          </p>
        )}
      </form>
    </div>
  );
}

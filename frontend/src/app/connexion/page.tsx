'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './connexion.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    // Simuler une vérification d'authentification
    setTimeout(() => {
      // Ici, dans une vraie application, on ferait un appel API
      // Pour l'instant, on simule juste une authentification réussie
      if (email && password) {
        router.push('/today');
      } else {
        setLoginError('Veuillez remplir tous les champs');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/logo/DecathlonMindsLogo.png" 
            alt="DecathlonMind Logo" 
            width={240} 
            height={60}
            priority
          />
        </div>
        
        <h1 className={styles.title}>Se connecter</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre adresse email"
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className={styles.input}
                required
              />
              <button 
                type="button" 
                className={styles.togglePasswordButton}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <Link href="/reset-password" className={styles.forgotPasswordLink}>
            Mot de passe oublié?
          </Link>
          
          {loginError && <p className={styles.errorMessage}>{loginError}</p>}
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className={styles.separator}>
          <div className={styles.separatorLine}></div>
          <span className={styles.separatorText}>ou continuer avec</span>
          <div className={styles.separatorLine}></div>
        </div>
        
        <div className={styles.socialButtons}>
          <button className={styles.googleButton}>
            <FcGoogle size={20} />
            Google
          </button>
          <button className={styles.appleButton}>
            <FaApple size={20} />
            Apple
          </button>
        </div>
        
        <p className={styles.signupLink}>
          Pas encore de compte? <Link href="/inscription" className={styles.signupLinkText}>S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './inscription.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function InscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    postalCode: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur pour ce champ lorsqu'il est modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'adresse email n\'est pas valide';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = 'La date de naissance est requise';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions générales';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simuler un appel API pour l'inscription
    try {
      // Simule une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers la page de félicitation
      router.push('/felicitation');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        
        <h1 className={styles.title}>Créer un compte</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {errors.general && <p className={styles.errorMessage}>{errors.general}</p>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Nom complet</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez votre nom complet"
              className={styles.input}
            />
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre adresse email"
              className={styles.input}
            />
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="birthdate" className={styles.label}>Date de naissance</label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              className={styles.dateInput}
            />
            {errors.birthdate && <p className={styles.fieldError}>{errors.birthdate}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="postalCode" className={styles.label}>Code postal</label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Entrez votre code postal"
              className={styles.input}
            />
            {errors.postalCode && <p className={styles.fieldError}>{errors.postalCode}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Créez un mot de passe"
                className={styles.input}
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
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmer le mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                className={styles.input}
              />
              <button 
                type="button" 
                className={styles.togglePasswordButton}
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword}</p>}
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
              J&apos;accepte les <Link href="/terms" className={styles.link}>conditions générales</Link> et la <Link href="/privacy" className={styles.link}>politique de confidentialité</Link>
            </label>
          </div>
          {errors.acceptTerms && <p className={styles.fieldError}>{errors.acceptTerms}</p>}
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
        
        <div className={styles.separator}>
          <div className={styles.separatorLine}></div>
          <span className={styles.separatorText}>ou s'inscrire avec</span>
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
        
        <p className={styles.loginLink}>
          Déjà inscrit ? <Link href="/connexion" className={styles.signinLink}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

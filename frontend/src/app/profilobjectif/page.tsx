'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './profilObjectif.module.css';
import StepBar from '@/components/StepBar/StepBar';
import ProfileAvatar from '@/components/ProfileAvatar/ProfileAvatar';
import { useProfileObjective } from '@/context/ProfileObjectiveContext';

// Étape 1 : Objectifs
const Step1Objectives = ({ onNext }: { onNext: () => void }) => {
  const { profileData, updateObjectives, updateUserName } = useProfileObjective();
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(profileData.objectives);
  
  // On simule la récupération du nom d'utilisateur - à remplacer par un appel API
  useEffect(() => {
    // Simuler la récupération du nom à partir du backend
    const loadUserData = async () => {
      // Ceci serait un appel API réel
      const userName = localStorage.getItem('userName') || 'Utilisateur';
      updateUserName(userName);
    };
    
    loadUserData();
  }, [updateUserName]);
  
  const objectives = [
    "Mieux dormir",
    "Être plus actif",
    "Lâcher prise",
    "Améliorer la concentration",
    "Diminuer mon stress"
  ];
  
  const toggleObjective = (objective: string) => {
    setSelectedObjectives(prev => {
      if (prev.includes(objective)) {
        return prev.filter(item => item !== objective);
      } else {
        return [...prev, objective];
      }
    });
  };
  
  const handleContinue = () => {
    updateObjectives(selectedObjectives);
    onNext();
  };
  
  return (
    <>
      <div className={styles.stepContentContainer}>
        <h1 className={styles.title}>Quels sont vos objectifs ?</h1>
        
        <div className={styles.optionsContainer}>
          {objectives.map((objective) => (
            <button
              key={objective}
              type="button"
              className={`${styles.optionButton} ${selectedObjectives.includes(objective) ? styles.selected : ''}`}
              onClick={() => toggleObjective(objective)}
            >
              <span className={styles.optionLabel}>{objective}</span>
              <div className={styles.optionCheckbox}>
                {selectedObjectives.includes(objective) && (
                  <svg className={styles.checkIcon} width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={selectedObjectives.length === 0}
        >
          Continuer
        </button>
      </div>
    </>
  );
};

// Étape 2 : Freins
const Step2Barriers = ({ onNext }: { onNext: () => void }) => {
  const { profileData, updateBarriers } = useProfileObjective();
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>(profileData.barriers);
  
  const barriers = [
    "Douleurs physiques",
    "Manque de temps",
    "Enfant en bas âge",
    "Fatigue",
    "Manque de motivation"
  ];
  
  const toggleBarrier = (barrier: string) => {
    setSelectedBarriers(prev => {
      if (prev.includes(barrier)) {
        return prev.filter(item => item !== barrier);
      } else {
        return [...prev, barrier];
      }
    });
  };
  
  const handleContinue = () => {
    updateBarriers(selectedBarriers);
    onNext();
  };
  
  return (
    <>
      <div className={styles.stepContentContainer}>
        <h1 className={styles.title}>Quels seraient les freins à la pratique d&apos;une activité type marche ou course ?</h1>
        
        <div className={styles.optionsContainer}>
          {barriers.map((barrier) => (
            <button
              key={barrier}
              type="button"
              className={`${styles.optionButton} ${selectedBarriers.includes(barrier) ? styles.selected : ''}`}
              onClick={() => toggleBarrier(barrier)}
            >
              <span className={styles.optionLabel}>{barrier}</span>
              <div className={styles.optionCheckbox}>
                {selectedBarriers.includes(barrier) && (
                  <svg className={styles.checkIcon} width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={selectedBarriers.length === 0}
        >
          Continuer
        </button>
      </div>
    </>
  );
};

// Étape 3 : Jour disponible
const Step3AvailableDay = ({ onNext }: { onNext: () => void }) => {
  const { profileData, updateAvailableDay } = useProfileObjective();
  const [selectedDay, setSelectedDay] = useState<string>(profileData.availableDay);
  
  const days = [
    { short: "Lu", full: "Lundi" },
    { short: "Ma", full: "Mardi" },
    { short: "Me", full: "Mercredi" },
    { short: "Je", full: "Jeudi" },
    { short: "Ve", full: "Vendredi" },
    { short: "Sa", full: "Samedi" },
    { short: "Di", full: "Dimanche" }
  ];
  
  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
  };
  
  const handleContinue = () => {
    updateAvailableDay(selectedDay);
    onNext();
  };
  
  return (
    <>
      <div className={styles.stepContentContainer}>
        <h1 className={styles.title}>Quel serait votre jour de disponibilité pour marcher ou courir ?</h1>
        
        <div className={styles.daySelector}>
          {days.map((day) => (
            <button
              key={day.full}
              type="button"
              className={`${styles.dayButton} ${selectedDay === day.full ? styles.selected : ''}`}
              onClick={() => handleSelectDay(day.full)}
            >
              <span className={styles.dayShort}>{day.short}</span>
              <span className={styles.dayFull}>{day.full}</span>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={!selectedDay}
        >
          Continuer
        </button>
      </div>
    </>
  );
};

// Étape 4 : Heure préférée
const Step4PreferredTime = ({ onFinish }: { onFinish: () => void }) => {
  const { profileData, updatePreferredTime } = useProfileObjective();
  const [selectedTime, setSelectedTime] = useState<string>(profileData.preferredTime);
  
  const times = [
    "Matin (6h - 9h)",
    "Milieu de matinée (9h - 12h)",
    "Après-midi (12h - 17h)",
    "Soirée (17h - 21h)",
    "Nuit (après 21h)"
  ];
  
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleContinue = () => {
    updatePreferredTime(selectedTime);
    onFinish();
  };
  
  return (
    <>
      <div className={styles.stepContentContainer}>
        <h1 className={styles.title}>Quelle est votre heure préférée pour être actif ?</h1>
        
        <div className={styles.timeSelector}>
          {times.map((time) => (
            <button
              key={time}
              type="button"
              className={`${styles.timeButton} ${selectedTime === time ? styles.selected : ''}`}
              onClick={() => handleSelectTime(time)}
            >
              <svg className={styles.timeIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.timeLabel}>{time}</span>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={!selectedTime}
        >
          Commencer
        </button>
      </div>
    </>
  );
};

// Page principale
export default function ProfileObjectivePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { profileData } = useProfileObjective();

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const finishSetup = () => {
    // Logique de sauvegarde des données
    // Puis redirection vers la page ready
    router.push('/ready');
  };

  // Mapping des étapes aux composants
  const stepComponents = {
    1: <Step1Objectives onNext={goToNextStep} />,
    2: <Step2Barriers onNext={goToNextStep} />,
    3: <Step3AvailableDay onNext={goToNextStep} />,
    4: <Step4PreferredTime onFinish={finishSetup} />
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Image 
          src="/decathlonminds_logo.svg" 
          alt="DecathlonMind Logo" 
          width={180} 
          height={40}
          className={styles.logo}
          priority
        />
        <div className={styles.userInfo}>
          {profileData.userName && (
            <>
              <span className={styles.userName}>{profileData.userName}</span>
              <ProfileAvatar userName={profileData.userName} />
            </>
          )}
        </div>
      </div>

      <StepBar currentStep={currentStep} totalSteps={4} />
      
      {/* Affichage du composant d'étape actuel */}
      {stepComponents[currentStep as keyof typeof stepComponents]}
    </div>
  );
}

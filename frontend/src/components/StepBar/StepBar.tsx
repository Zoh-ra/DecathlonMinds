import React from 'react';
import styles from './StepBar.module.css';

interface StepBarProps {
  currentStep: number;
  totalSteps: number;
}

const StepBar: React.FC<StepBarProps> = ({ currentStep, totalSteps }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={styles.stepBarContainer}>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          let statusClass = '';
          
          if (stepNumber < currentStep) {
            statusClass = styles.completed;
          } else if (stepNumber === currentStep) {
            statusClass = styles.current;
          }
          
          return (
            <div key={stepNumber} className={`${styles.step} ${statusClass}`}>
              <div className={styles.stepCircle}>
                {stepNumber < currentStep ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepBar;

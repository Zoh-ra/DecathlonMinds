'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileObjectiveData {
  objectives: string[];
  barriers: string[];
  availableDay: string;
  preferredTime: string;
  userName: string;
}

interface ProfileContextType {
  profileData: ProfileObjectiveData;
  updateObjectives: (objectives: string[]) => void;
  updateBarriers: (barriers: string[]) => void;
  updateAvailableDay: (day: string) => void;
  updatePreferredTime: (time: string) => void;
  updateUserName: (name: string) => void;
}

const defaultProfileData: ProfileObjectiveData = {
  objectives: [],
  barriers: [],
  availableDay: '',
  preferredTime: '',
  userName: ''
};

const ProfileObjectiveContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileObjectiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileObjectiveData>(defaultProfileData);

  const updateObjectives = (objectives: string[]) => {
    setProfileData(prev => ({ ...prev, objectives }));
  };

  const updateBarriers = (barriers: string[]) => {
    setProfileData(prev => ({ ...prev, barriers }));
  };

  const updateAvailableDay = (day: string) => {
    setProfileData(prev => ({ ...prev, availableDay: day }));
  };

  const updatePreferredTime = (time: string) => {
    setProfileData(prev => ({ ...prev, preferredTime: time }));
  };

  const updateUserName = (name: string) => {
    setProfileData(prev => ({ ...prev, userName: name }));
  };

  return (
    <ProfileObjectiveContext.Provider
      value={{
        profileData,
        updateObjectives,
        updateBarriers,
        updateAvailableDay,
        updatePreferredTime,
        updateUserName
      }}
    >
      {children}
    </ProfileObjectiveContext.Provider>
  );
};

export const useProfileObjective = () => {
  const context = useContext(ProfileObjectiveContext);
  if (context === undefined) {
    throw new Error('useProfileObjective must be used within a ProfileObjectiveProvider');
  }
  return context;
};

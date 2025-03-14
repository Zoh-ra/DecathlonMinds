import React from 'react';
import styles from './ProfileAvatar.module.css';

interface ProfileAvatarProps {
  userName: string;
  size?: 'small' | 'medium' | 'large';
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  userName, 
  size = 'medium' 
}) => {
  // Obtenir la première lettre du nom d'utilisateur
  const getInitial = () => {
    if (!userName) return '?';
    return userName.charAt(0).toUpperCase();
  };

  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      {getInitial()}
    </div>
  );
};

export default ProfileAvatar;

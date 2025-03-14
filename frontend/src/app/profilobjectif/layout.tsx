'use client';

import React from 'react';
import { ProfileObjectiveProvider } from '@/context/ProfileObjectiveContext';

export default function ProfileObjectiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileObjectiveProvider>
      {children}
    </ProfileObjectiveProvider>
  );
}

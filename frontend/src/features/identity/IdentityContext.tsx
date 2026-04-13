import React, { createContext, use, useCallback, useMemo, useState } from 'react';
import { TAIdentity } from '../../api/dashboard/types';

export interface Identity {
  user?: number;
  role?: number;
  location?: string;
  instance?: number;
}

interface IdentityContextType {
  identity?: Identity;
  detailedIdentity?: TAIdentity;
  setIdentity: React.Dispatch<React.SetStateAction<Identity | undefined>>;
  setDetailedIdentity: (value?: TAIdentity) => void;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localStorageIdentityKey = 'selectedIdentity';
  const [identity, setIdentity] = useState<Identity>();
  const [detailedIdentity, setDetailedIdentity] = useState<TAIdentity | undefined>(() => {
    const stored = localStorage.getItem(localStorageIdentityKey);
    return stored ? JSON.parse(stored) : undefined;
  });

  const handleSetDetailedIdentity = useCallback((value?: TAIdentity) => {
    localStorage.setItem(localStorageIdentityKey, JSON.stringify(value));
    setDetailedIdentity(value);
  }, []);

  const value = useMemo(() => {
    return {
      identity,
      detailedIdentity,
      setIdentity,
      setDetailedIdentity: handleSetDetailedIdentity,
    };
  }, [identity, detailedIdentity]);

  return <IdentityContext value={value}>{children}</IdentityContext>;
};

export const useIdentityContext = () => {
  const context = use(IdentityContext);
  if (!context) {
    throw new Error('useIdentityContext must be used within an IdentityProvider');
  }
  return context;
};

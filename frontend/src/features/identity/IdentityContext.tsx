import React, { createContext, use, useMemo, useState } from 'react';
import { TAIdentity } from '../../api/dashboard/types';

export interface Identity {
  user?: number;
  role?: number;
  location?: string;
  instance?: number;
}

interface IdentityContextType {
  identity?: Identity;
  detailedIdentity?: TAIdentity | null;
  setIdentity: React.Dispatch<React.SetStateAction<Identity | undefined>>;
  setDetailedIdentity: React.Dispatch<React.SetStateAction<TAIdentity | null | undefined>>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity>();
  const [detailedIdentity, setDetailedIdentity] = useState<TAIdentity | null>();

  const value = useMemo(() => {
    return { identity, detailedIdentity, setIdentity, setDetailedIdentity };
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

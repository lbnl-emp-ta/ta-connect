import React, { createContext, use, useMemo, useState } from 'react';

export interface Identity {
  user?: number;
  role?: number;
  location?: string;
  instance?: number;
}

interface IdentityContextType {
  identity?: Identity;
  setIdentity: React.Dispatch<React.SetStateAction<Identity | undefined>>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity>();

  const value = useMemo(() => {
    return { identity, setIdentity };
  }, [identity]);

  return <IdentityContext value={value}>{children}</IdentityContext>;
};

export const useIdentityContext = () => {
  const context = use(IdentityContext);
  if (!context) {
    throw new Error('useIdentityContext must be used within an IdentityProvider');
  }
  return context;
};

import React, { createContext, use, useMemo, useState } from 'react';

export interface Identity {
  user?: string;
  program?: string;
  location?: string;
  instance?: string;
}

interface IdentityContextType {
  identity: Identity;
  setIdentity: React.Dispatch<React.SetStateAction<Identity>>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity>({
    user: 'ctodonnell@lbl.gov',
    program: undefined,
    location: 'reception',
    instance: undefined,
  });

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

import React, { createContext, use, useMemo, useState } from 'react';

interface AdminModeContextType {
  isAdminMode: boolean;
  setIsAdminMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export const AdminModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  const value = useMemo(() => {
    return {
      isAdminMode,
      setIsAdminMode,
    };
  }, [isAdminMode, setIsAdminMode]);

  return <AdminModeContext value={value}>{children}</AdminModeContext>;
};

export const useAdminModeContext = () => {
  const context = use(AdminModeContext);
  if (!context) {
    throw new Error('useAdminModeContext must be used within an AdminModeProvider');
  }
  return context;
};

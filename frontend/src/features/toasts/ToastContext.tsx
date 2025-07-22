import React, { createContext, use, useMemo, useState } from 'react';

export interface Toast {
  user?: number;
  role?: number;
  location?: string;
  instance?: number;
}

interface ToastContextType {
  showToast: boolean;
  toastMessage?: React.ReactNode;
  setShowToast: React.Dispatch<React.SetStateAction<boolean>>;
  setToastMessage: React.Dispatch<React.SetStateAction<React.ReactNode | undefined>>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<React.ReactNode>();

  const value = useMemo(() => {
    return { showToast, toastMessage, setShowToast, setToastMessage };
  }, [showToast, toastMessage]);

  return <ToastContext value={value}>{children}</ToastContext>;
};

export const useToastContext = () => {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

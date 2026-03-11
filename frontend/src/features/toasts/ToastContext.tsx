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
  toastAutoHideDuration?: number | null;
  setShowToast: React.Dispatch<React.SetStateAction<boolean>>;
  setToastMessage: React.Dispatch<React.SetStateAction<React.ReactNode | undefined>>;
  setToastAutoHideDuration: React.Dispatch<React.SetStateAction<number | null | undefined>>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<React.ReactNode>();
  const [toastAutoHideDuration, setToastAutoHideDuration] = useState<number | null | undefined>(
    6000
  );

  const value = useMemo(() => {
    return {
      showToast,
      toastMessage,
      toastAutoHideDuration,
      setShowToast,
      setToastMessage,
      setToastAutoHideDuration,
    };
  }, [showToast, toastMessage, toastAutoHideDuration]);

  return <ToastContext value={value}>{children}</ToastContext>;
};

export const useToastContext = () => {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

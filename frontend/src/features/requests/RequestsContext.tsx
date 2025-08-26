import React, { createContext, use, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';

interface RequestsContextType {
  sortedRequests: TARequest[];
  setSortedRequests: React.Dispatch<React.SetStateAction<TARequest[]>>;
  sortField: string;
  setSortField: React.Dispatch<React.SetStateAction<string>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  nextId: number | null;
  previousId: number | null;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortedRequests, setSortedRequests] = useState<TARequest[]>([]);
  const [sortField, setSortField] = useState('-date_created');
  const [currentIndex, setCurrentIndex] = useState(0);

  const value = useMemo(() => {
    let nextId: number | null = null;
    let previousId: number | null = null;
    if (sortedRequests) {
      const nextIndex = currentIndex < sortedRequests.length - 1 ? currentIndex + 1 : null;
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : null;
      nextId = nextIndex !== null ? sortedRequests[nextIndex]?.id : null;
      previousId = previousIndex !== null ? sortedRequests[previousIndex]?.id : null;
    }
    return {
      currentIndex,
      setCurrentIndex,
      nextId,
      previousId,
      sortedRequests,
      setSortedRequests,
      sortField,
      setSortField,
    };
  }, [currentIndex, sortedRequests, sortField]);

  return <RequestsContext value={value}>{children}</RequestsContext>;
};

export const useRequestsContext = () => {
  const context = use(RequestsContext);
  if (!context) {
    throw new Error('useRequestsContext must be used within a RequestsProvider');
  }
  return context;
};

import React, { createContext, use, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';

interface RequestsContextType {
  sortedRequests: TARequest[];
  setSortedRequests: React.Dispatch<React.SetStateAction<TARequest[]>>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortedRequests, setSortedRequests] = useState<TARequest[]>([]);
  const value = useMemo(() => {
    return { sortedRequests, setSortedRequests };
  }, [sortedRequests]);

  return <RequestsContext value={value}>{children}</RequestsContext>;
};

export const useRequestsContext = () => {
  const context = use(RequestsContext);
  if (!context) {
    throw new Error('useRequestsContext must be used within a RequestsProvider');
  }
  return context;
};

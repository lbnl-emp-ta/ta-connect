import React, { createContext, use, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';

interface RequestsContextType {
  sortedRequests: TARequest[];
  setSortedRequests: React.Dispatch<React.SetStateAction<TARequest[]>>;
  sortField: string;
  setSortField: React.Dispatch<React.SetStateAction<string>>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortedRequests, setSortedRequests] = useState<TARequest[]>([]);
  const [sortField, setSortField] = useState('-date_created');

  const value = useMemo(() => {
    return { sortedRequests, setSortedRequests, sortField, setSortField };
  }, [sortedRequests, sortField]);

  return <RequestsContext value={value}>{children}</RequestsContext>;
};

export const useRequestsContext = () => {
  const context = use(RequestsContext);
  if (!context) {
    throw new Error('useRequestsContext must be used within a RequestsProvider');
  }
  return context;
};

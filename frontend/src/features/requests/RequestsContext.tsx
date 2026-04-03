import React, { createContext, use, useCallback, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';

interface RequestsContextType {
  sortedRequestsMap: Record<string, TARequest[]>;
  setSortedRequestsForList: (listId: string, requests: TARequest[]) => void;
  sortField: string;
  setSortField: React.Dispatch<React.SetStateAction<string>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  nextId: number | null;
  previousId: number | null;
  tab: 'active' | 'inactive';
  selectedListId: string | null;
  setSelectedListId: React.Dispatch<React.SetStateAction<string | null>>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

interface RequestsProviderProps extends React.PropsWithChildren {
  tab: RequestsContextType['tab'];
}

export const RequestsProvider: React.FC<RequestsProviderProps> = ({ tab, children }) => {
  const [sortedRequestsMap, setSortedRequestsMap] = useState<Record<string, TARequest[]>>({});
  const [sortField, setSortField] = useState('-date_created');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const setSortedRequestsForList = useCallback((listId: string, requests: TARequest[]) => {
    setSortedRequestsMap((prev) => ({
      ...prev,
      [listId]: requests,
    }));
  }, []);

  const value = useMemo(() => {
    let nextId: number | null = null;
    let previousId: number | null = null;
    const activeList = selectedListId ? (sortedRequestsMap[selectedListId] ?? []) : [];
    if (activeList.length > 0) {
      const nextIndex = currentIndex < activeList.length - 1 ? currentIndex + 1 : null;
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : null;
      nextId = nextIndex !== null ? (activeList[nextIndex]?.id ?? null) : null;
      previousId = previousIndex !== null ? (activeList[previousIndex]?.id ?? null) : null;
    }
    return {
      tab,
      currentIndex,
      setCurrentIndex,
      nextId,
      previousId,
      sortedRequestsMap,
      setSortedRequestsForList,
      sortField,
      setSortField,
      selectedListId,
      setSelectedListId,
    };
  }, [currentIndex, sortedRequestsMap, sortField, selectedListId, setSortedRequestsForList]);

  return <RequestsContext value={value}>{children}</RequestsContext>;
};

export const useRequestsContext = () => {
  const context = use(RequestsContext);
  if (!context) {
    throw new Error('useRequestsContext must be used within a RequestsProvider');
  }
  return context;
};

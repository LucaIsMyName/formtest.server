import { useState, useMemo, useEffect } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export function useSortableData<T>(
  items: T[],
  initialConfig: SortConfig<T> = { key: null, direction: null },
  storageKey?: string // Optional key for localStorage persistence
) {
  // Load initial state from localStorage if key provided
  const getInitialState = (): SortConfig<T> => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(`sort_${storageKey}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load sort state from localStorage:', e);
      }
    }
    return initialConfig;
  };

  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(getInitialState);

  // Persist to localStorage when sort changes
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`sort_${storageKey}`, JSON.stringify(sortConfig));
      } catch (e) {
        console.warn('Failed to save sort state to localStorage:', e);
      }
    }
  }, [sortConfig, storageKey]);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'de', { sensitivity: 'base' });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle dates (as strings)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
      }

      // Fallback to string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // Cycle through: asc -> desc -> null
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        if (current.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortDirection = (key: keyof T): SortDirection => {
    if (sortConfig.key === key) {
      return sortConfig.direction;
    }
    return null;
  };

  return { sortedItems, requestSort, sortConfig, getSortDirection };
}

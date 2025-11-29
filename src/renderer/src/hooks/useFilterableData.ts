import { useState, useMemo, useEffect } from 'react';

export interface FilterConfig {
  searchTerm: string;
  statusFilter?: string;
}

export function useFilterableData<T extends object>(
  items: T[],
  searchableKeys: (keyof T)[],
  initialFilter: FilterConfig = { searchTerm: '', statusFilter: undefined },
  storageKey?: string // Optional key for localStorage persistence
) {
  // Load initial state from localStorage if key provided
  const getInitialState = (): FilterConfig => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(`filter_${storageKey}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load filter state from localStorage:', e);
      }
    }
    return initialFilter;
  };

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(getInitialState);

  // Persist to localStorage when filter changes
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`filter_${storageKey}`, JSON.stringify(filterConfig));
      } catch (e) {
        console.warn('Failed to save filter state to localStorage:', e);
      }
    }
  }, [filterConfig, storageKey]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Apply status filter if set
    if (filterConfig.statusFilter && filterConfig.statusFilter !== 'all') {
      result = result.filter((item) => {
        const record = item as Record<string, unknown>;
        
        // Check for 'status' property (e.g., TestRuns)
        if ('status' in record) {
          return record['status'] === filterConfig.statusFilter;
        }
        
        // Check for 'isActive' property (e.g., Forms, PaymentMethods, Schedules)
        if ('isActive' in record) {
          const isActive = record['isActive'] as boolean;
          if (filterConfig.statusFilter === 'active') {
            return isActive === true;
          }
          if (filterConfig.statusFilter === 'inactive') {
            return isActive === false;
          }
        }
        
        return true;
      });
    }

    // Apply search term filter
    if (filterConfig.searchTerm.trim()) {
      const searchLower = filterConfig.searchTerm.toLowerCase().trim();
      result = result.filter((item) => {
        return searchableKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    return result;
  }, [items, filterConfig, searchableKeys]);

  const setSearchTerm = (term: string) => {
    setFilterConfig((current) => ({ ...current, searchTerm: term }));
  };

  const setStatusFilter = (status: string | undefined) => {
    setFilterConfig((current) => ({ ...current, statusFilter: status }));
  };

  const clearFilters = () => {
    setFilterConfig({ searchTerm: '', statusFilter: undefined });
  };

  return {
    filteredItems,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters,
  };
}

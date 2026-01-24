import { useState, useCallback } from "react";

interface UseTableSelectionReturn<T> {
  /** Set of selected item IDs */
  selectedIds: Set<number>;
  /** Whether all items on current page are selected */
  isAllSelected: boolean;
  /** Whether some but not all items are selected */
  isPartialSelected: boolean;
  /** Toggle selection of a single item */
  toggleItem: (id: number) => void;
  /** Select a single item (without toggle) */
  selectItem: (id: number) => void;
  /** Deselect a single item */
  deselectItem: (id: number) => void;
  /** Toggle selection of all items on current page */
  toggleAll: (pageItems: T[]) => void;
  /** Select all items on current page */
  selectAll: (pageItems: T[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Number of selected items */
  selectedCount: number;
  /** Check if a specific item is selected */
  isSelected: (id: number) => boolean;
  /** Get array of selected IDs */
  getSelectedIds: () => number[];
}

export function useTableSelection<T extends { id: number }>(): UseTableSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectItem = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselectItem = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((pageItems: T[]) => {
    setSelectedIds((prev) => {
      const pageIds = pageItems.map((item) => item.id);
      const allSelected = pageIds.every((id) => prev.has(id));

      if (allSelected) {
        // Deselect all page items
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      } else {
        // Select all page items
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      }
    });
  }, []);

  const selectAll = useCallback((pageItems: T[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageItems.forEach((item) => next.add(item.id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: number) => selectedIds.has(id),
    [selectedIds]
  );

  const getSelectedIds = useCallback(
    () => Array.from(selectedIds),
    [selectedIds]
  );

  const selectedCount = selectedIds.size;

  // These need to be computed based on current page items
  // We'll compute them when needed in the component
  const isAllSelected = false; // Will be computed in component
  const isPartialSelected = selectedCount > 0;

  return {
    selectedIds,
    isAllSelected,
    isPartialSelected,
    toggleItem,
    selectItem,
    deselectItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectedCount,
    isSelected,
    getSelectedIds,
  };
}

/**
 * Helper to compute if all page items are selected
 */
export function computeIsAllSelected<T extends { id: number }>(
  pageItems: T[],
  selectedIds: Set<number>
): boolean {
  if (pageItems.length === 0) return false;
  return pageItems.every((item) => selectedIds.has(item.id));
}

/**
 * Helper to compute if some page items are selected
 */
export function computeIsPartialSelected<T extends { id: number }>(
  pageItems: T[],
  selectedIds: Set<number>
): boolean {
  if (pageItems.length === 0) return false;
  const selectedOnPage = pageItems.filter((item) => selectedIds.has(item.id));
  return selectedOnPage.length > 0 && selectedOnPage.length < pageItems.length;
}

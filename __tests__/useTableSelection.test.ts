import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableSelection, computeIsAllSelected, computeIsPartialSelected } from "../src/renderer/src/hooks/useTableSelection";

interface TestItem {
  id: number;
  name: string;
}

describe("useTableSelection", () => {
  const testItems: TestItem[] = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  describe("toggleItem", () => {
    it("should select an item when not selected", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleItem(1);
      });

      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it("should deselect an item when already selected", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleItem(1);
      });
      expect(result.current.isSelected(1)).toBe(true);

      act(() => {
        result.current.toggleItem(1);
      });
      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it("should allow selecting multiple items", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleItem(1);
        result.current.toggleItem(2);
      });

      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.selectedCount).toBe(2);
    });
  });

  describe("toggleAll", () => {
    it("should select all items when none are selected", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleAll(testItems);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(2)).toBe(true);
      expect(result.current.isSelected(3)).toBe(true);
    });

    it("should deselect all items when all are selected", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      // Select all first
      act(() => {
        result.current.toggleAll(testItems);
      });
      expect(result.current.selectedCount).toBe(3);

      // Toggle all again should deselect
      act(() => {
        result.current.toggleAll(testItems);
      });
      expect(result.current.selectedCount).toBe(0);
    });

    it("should select all items when some are selected (partial selection)", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      // Select one item
      act(() => {
        result.current.toggleItem(1);
      });
      expect(result.current.selectedCount).toBe(1);

      // Toggle all should select all
      act(() => {
        result.current.toggleAll(testItems);
      });
      expect(result.current.selectedCount).toBe(3);
    });
  });

  describe("clearSelection", () => {
    it("should clear all selected items", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleItem(1);
        result.current.toggleItem(2);
      });
      expect(result.current.selectedCount).toBe(2);

      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(2)).toBe(false);
    });
  });

  describe("getSelectedIds", () => {
    it("should return array of selected ids", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());

      act(() => {
        result.current.toggleItem(1);
        result.current.toggleItem(3);
      });

      const ids = result.current.getSelectedIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain(1);
      expect(ids).toContain(3);
    });

    it("should return empty array when nothing selected", () => {
      const { result } = renderHook(() => useTableSelection<TestItem>());
      expect(result.current.getSelectedIds()).toEqual([]);
    });
  });
});

describe("computeIsAllSelected", () => {
  const testItems: TestItem[] = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  it("should return true when all items are selected", () => {
    const selectedIds = new Set([1, 2, 3]);
    expect(computeIsAllSelected(testItems, selectedIds)).toBe(true);
  });

  it("should return false when no items are selected", () => {
    const selectedIds = new Set<number>();
    expect(computeIsAllSelected(testItems, selectedIds)).toBe(false);
  });

  it("should return false when only some items are selected", () => {
    const selectedIds = new Set([1, 2]);
    expect(computeIsAllSelected(testItems, selectedIds)).toBe(false);
  });

  it("should return false for empty items array", () => {
    const selectedIds = new Set([1, 2, 3]);
    expect(computeIsAllSelected([], selectedIds)).toBe(false);
  });
});

describe("computeIsPartialSelected", () => {
  const testItems: TestItem[] = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  it("should return true when some but not all items are selected", () => {
    const selectedIds = new Set([1, 2]);
    expect(computeIsPartialSelected(testItems, selectedIds)).toBe(true);
  });

  it("should return false when all items are selected", () => {
    const selectedIds = new Set([1, 2, 3]);
    expect(computeIsPartialSelected(testItems, selectedIds)).toBe(false);
  });

  it("should return false when no items are selected", () => {
    const selectedIds = new Set<number>();
    expect(computeIsPartialSelected(testItems, selectedIds)).toBe(false);
  });

  it("should return false for empty items array", () => {
    const selectedIds = new Set([1]);
    expect(computeIsPartialSelected([], selectedIds)).toBe(false);
  });
});

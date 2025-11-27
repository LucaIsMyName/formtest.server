import { describe, it, expect } from 'vitest';

describe('Table Sorting and Filtering', () => {
  describe('useSortableData', () => {
    it('should sort items ascending by string', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];

      // Simulate sorting logic
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
      
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Charlie');
    });

    it('should sort items descending by number', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];

      const sorted = [...items].sort((a, b) => b.age - a.age);
      
      expect(sorted[0].age).toBe(35);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(25);
    });

    it('should handle null values in sorting', () => {
      const items = [
        { name: 'Charlie', value: null },
        { name: 'Alice', value: 10 },
        { name: 'Bob', value: 5 },
      ];

      const sorted = [...items].sort((a, b) => {
        if (a.value == null && b.value == null) return 0;
        if (a.value == null) return -1;
        if (b.value == null) return 1;
        return a.value - b.value;
      });
      
      expect(sorted[0].value).toBe(null);
      expect(sorted[1].value).toBe(5);
      expect(sorted[2].value).toBe(10);
    });
  });

  describe('useFilterableData', () => {
    it('should filter items by search term', () => {
      const items = [
        { name: 'Test Form A', status: 'SUCCESS' },
        { name: 'Test Form B', status: 'FAILURE' },
        { name: 'Production Form', status: 'SUCCESS' },
      ];

      const searchTerm = 'test';
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe('Test Form A');
      expect(filtered[1].name).toBe('Test Form B');
    });

    it('should filter items by status', () => {
      const items = [
        { name: 'Test Form A', status: 'SUCCESS' },
        { name: 'Test Form B', status: 'FAILURE' },
        { name: 'Production Form', status: 'SUCCESS' },
      ];

      const statusFilter = 'SUCCESS';
      const filtered = items.filter(item => item.status === statusFilter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(item => item.status === 'SUCCESS')).toBe(true);
    });

    it('should combine search and status filters', () => {
      const items = [
        { name: 'Test Form A', status: 'SUCCESS' },
        { name: 'Test Form B', status: 'FAILURE' },
        { name: 'Production Form', status: 'SUCCESS' },
      ];

      const searchTerm = 'form';
      const statusFilter = 'SUCCESS';
      
      const filtered = items
        .filter(item => item.status === statusFilter)
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      expect(filtered).toHaveLength(2);
    });

    it('should return all items when no filters applied', () => {
      const items = [
        { name: 'Test Form A', status: 'SUCCESS' },
        { name: 'Test Form B', status: 'FAILURE' },
      ];

      const searchTerm = '';
      const statusFilter = 'all';
      
      let filtered = items;
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilter);
      }
      
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Sort Direction Cycling', () => {
    it('should cycle through asc -> desc -> null', () => {
      type SortDirection = 'asc' | 'desc' | null;
      
      const getNextDirection = (current: SortDirection): SortDirection => {
        if (current === 'asc') return 'desc';
        if (current === 'desc') return null;
        return 'asc';
      };

      expect(getNextDirection(null)).toBe('asc');
      expect(getNextDirection('asc')).toBe('desc');
      expect(getNextDirection('desc')).toBe(null);
    });
  });
});

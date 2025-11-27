import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';

interface StatusOption {
  value: string;
  label: string;
}

interface TableFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: StatusOption[];
  onClear?: () => void;
}

export const TableFilter: React.FC<TableFilterProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Suchen...',
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  onClear,
}) => {
  const hasFilters = searchTerm.trim() !== '' || (statusFilter && statusFilter !== 'all');

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-8"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {statusOptions && onStatusFilterChange && (
        <Select value={statusFilter || 'all'} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && onClear && (
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
};

export default TableFilter;

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger } from './Select';
import { Badge, StatusBadge } from './Badge';

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
  statusLabel?: string;
  onClear?: () => void;
}

export const TableFilter: React.FC<TableFilterProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Suchen...',
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  statusLabel = 'Status',
  onClear,
}) => {
  const hasFilters = searchTerm.trim() !== '' || (statusFilter && statusFilter !== 'all');

  // Map status value to badge variant
  const getVariantForStatus = (status: string): "success" | "error" | "stopped" | "running" | "queued" | "active" | "inactive" | "default" => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "ACTIVE":
        return "success";
      case "FAILURE":
      case "ERROR":
        return "error";
      case "RUNNING":
        return "running";
      case "QUEUED":
        return "queued";
      case "STOPPED":
        return "stopped";
      case "INACTIVE":
        return "inactive";
      default:
        return "default";
    }
  };

  // Get the current selected status for display in trigger (without icon to avoid duplication)
  const getSelectedStatusDisplay = () => {
    if (!statusFilter || statusFilter === 'all') {
      return <span className="text-gray-600 dark:text-gray-400">Alle {statusLabel}</span>;
    }
    const option = statusOptions?.find(o => o.value === statusFilter);
    if (option) {
      return <Badge variant={getVariantForStatus(option.value)}>{option.label}</Badge>;
    }
    return statusFilter;
  };

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
          <SelectTrigger className="w-44">
            {getSelectedStatusDisplay()}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-gray-600 dark:text-gray-400">Alle {statusLabel}</span>
            </SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <StatusBadge status={option.value}>{option.label}</StatusBadge>
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

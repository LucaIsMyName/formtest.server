import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { TableHead } from './Table';
import type { SortDirection } from '../../hooks/useSortableData';

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
  columnName?: string;
}

export const SortableTableHead: React.FC<SortableTableHeadProps> = ({
  children,
  sortDirection,
  onSort,
  className = '',
  columnName,
}) => {
  const isSortable = !!onSort;
  
  const getAriaSortValue = (): 'ascending' | 'descending' | 'none' | undefined => {
    if (!isSortable) return undefined;
    if (sortDirection === 'asc') return 'ascending';
    if (sortDirection === 'desc') return 'descending';
    return 'none';
  };

  return (
    <TableHead
      className={`${className} ${isSortable ? 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors' : ''}`}
      onClick={onSort}
      aria-sort={getAriaSortValue()}
      role={isSortable ? 'columnheader' : undefined}
      tabIndex={isSortable ? 0 : undefined}
      onKeyDown={isSortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort?.(); } } : undefined}
      aria-label={isSortable && columnName ? `Sortieren nach ${columnName}` : undefined}>
      <div className="flex items-center gap-1">
        <span className='block flex-1'>{children}</span>
        {isSortable && (
          <span className="inline-flex">
            {sortDirection === 'asc' ? (
              <ChevronUp size={14} className="text-blue-600 dark:text-blue-400" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown size={14} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronsUpDown size={14} className="text-neutral-400" />
            )}
          </span>
        )}
      </div>
    </TableHead>
  );
};

export default SortableTableHead;

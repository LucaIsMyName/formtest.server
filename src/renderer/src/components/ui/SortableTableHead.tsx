import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { TableHead } from './Table';
import type { SortDirection } from '../../hooks/useSortableData';

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
}

export const SortableTableHead: React.FC<SortableTableHeadProps> = ({
  children,
  sortDirection,
  onSort,
  className = '',
}) => {
  const isSortable = !!onSort;

  return (
    <TableHead
      className={`${className} ${isSortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors' : ''}`}
      onClick={onSort}>
      <div className="flex items-center gap-1">
        <span className='block flex-1'>{children}</span>
        {isSortable && (
          <span className="inline-flex">
            {sortDirection === 'asc' ? (
              <ChevronUp size={14} className="text-blue-600 dark:text-blue-400" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown size={14} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronsUpDown size={14} className="text-gray-400" />
            )}
          </span>
        )}
      </div>
    </TableHead>
  );
};

export default SortableTableHead;

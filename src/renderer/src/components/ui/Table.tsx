import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="overflow-x-auto">
    <table
      ref={ref}
      className={cn("w-full divide-y divide-gray-200 dark:divide-gray-700", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("select-normal px-4 py-3 whitespace-nowrap", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// Pagination component - styled like TableHeader but at bottom
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}) => {
  const [inputValue, setInputValue] = useState(String(currentPage));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        setInputValue(String(currentPage));
      }
    }
  };

  const handleInputBlur = () => {
    setInputValue(String(currentPage));
  };

  // Update input when currentPage changes externally
  React.useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800",
        className
      )}
    >
      {/* Left: Item count */}
      <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {startItem}–{endItem} von {totalItems}
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentPage <= 1
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          )}
          title="Vorherige Seite"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page input */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>Seite</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className={cn(
              "w-10 px-1.5 py-1 text-center text-[11px] font-mono rounded border",
              "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
              "text-gray-700 dark:text-gray-200",
              "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            )}
          />
          <span>von {totalPages}</span>
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentPage >= totalPages
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          )}
          title="Nächste Seite"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
TablePagination.displayName = "TablePagination";

// Default threshold for showing pagination
const DEFAULT_PAGINATION_THRESHOLD = 50;
const DEFAULT_ITEMS_PER_PAGE = 50;

// PaginatedTable - wrapper that automatically adds pagination when items > threshold
interface PaginatedTableProps<T> {
  data: T[];
  renderHeader: () => React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  threshold?: number;
  itemsPerPage?: number;
  className?: string;
  emptyMessage?: string;
}

function PaginatedTable<T>({
  data,
  renderHeader,
  renderRow,
  keyExtractor,
  threshold = DEFAULT_PAGINATION_THRESHOLD,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  className,
  emptyMessage = "Keine Einträge vorhanden"
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const showPagination = totalItems > threshold;
  
  // Reset to page 1 if current page becomes invalid
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Calculate paginated data
  const paginatedData = showPagination
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          {renderHeader()}
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <React.Fragment key={keyExtractor(item)}>
              {renderRow(item, index)}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {showPagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
PaginatedTable.displayName = "PaginatedTable";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination, PaginatedTable };

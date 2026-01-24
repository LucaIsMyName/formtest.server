import React, { useState, createContext, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { t } from "../../data/dictionary";

// Context for table-wide settings
interface TableContextValue {
  dividers: boolean;
}

const TableContext = createContext<TableContextValue>({ dividers: true });

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  dividers?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, dividers = true, ...props }, ref) => (
  <TableContext.Provider value={{ dividers }}>
    <div className="overflow-x-auto border border-neutral-300 dark:border-neutral-700 rounded-md select-text">
      <table
        ref={ref}
        className={cn("w-full divide-y divide-neutral-300 dark:divide-neutral-700", className)}
        {...props}
      />
    </div>
  </TableContext.Provider>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("bg-white dark:bg-neutral-800 divide-y divide-neutral-300 dark:divide-neutral-700", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  divider?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, divider, ...props }, ref) => {
  const { dividers: contextDividers } = useContext(TableContext);
  const showDivider = divider ?? contextDividers;

  return (
    <th
      ref={ref}
      scope="col"
      className={cn("px-4 py-3 text-left text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider", showDivider && "border-r border-neutral-300 dark:border-neutral-700 last:border-r-0", className)}
      {...props}
    />
  );
});
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  divider?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ className, divider, ...props }, ref) => {
  const { dividers: contextDividers } = useContext(TableContext);
  const showDivider = divider ?? contextDividers;

  return (
    <td
      ref={ref}
      className={cn(" px-4 py-3 whitespace-nowrap", showDivider && "border-r border-neutral-300 dark:border-neutral-700 last:border-r-0", className)}
      {...props}
    />
  );
});
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

const TablePagination: React.FC<TablePaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, className }) => {
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
    <div className={cn("flex items-center justify-between px-4 py-1 border-t border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800", className)}>
      {/* Left: Item count */}
      <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {startItem}–{endItem} von {totalItems}
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={t("table.pagination.previousPage")}
          className={cn("p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", currentPage <= 1 ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed" : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200")}>
          <ChevronLeft size={14} aria-hidden="true" />
        </button>

        {/* Page input */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <span>{t("table.pagination.page")}</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            aria-label={t("table.pagination.currentPage")}
            className={cn("w-10 px-1 py-1 text-center text-[10px] font-mono rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600", "text-neutral-700 dark:text-neutral-200")}
          />
          <span>{t("table.pagination.of")} {totalPages}</span>
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label={t("table.pagination.nextPage")}
          className={cn("p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", currentPage >= totalPages ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed" : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200")}>
          <ChevronRight size={14} aria-hidden="true" />
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

function PaginatedTable<T>({ data, renderHeader, renderRow, keyExtractor, threshold = DEFAULT_PAGINATION_THRESHOLD, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, className, emptyMessage = t("table.empty") }: PaginatedTableProps<T>) {
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
  const paginatedData = showPagination ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : data;

  if (data.length === 0) {
    return <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">{emptyMessage}</div>;
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>{renderHeader()}</TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <React.Fragment key={keyExtractor(item)}>{renderRow(item, index)}</React.Fragment>
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

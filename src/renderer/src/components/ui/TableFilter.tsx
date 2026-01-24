import React from "react";
import { Search, X, Tag } from "lucide-react";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Badge, StatusBadge } from "./Badge";
import { Checkbox } from "./Checkbox";
import { t } from "../../data/dictionary";

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
  /** Optional content to render on the right side (e.g., selection actions) */
  rightContent?: React.ReactNode;
  /** Show archived toggle */
  showArchived?: boolean;
  onShowArchivedChange?: (value: boolean) => void;
  /** Tag filter */
  tags?: Array<{ id: number; name: string; color: string }>;
  selectedTagIds?: number[];
  onTagFilterChange?: (tagIds: number[]) => void;
}

export const TableFilter: React.FC<TableFilterProps> = ({ searchTerm, onSearchChange, placeholder, statusFilter, onStatusFilterChange, statusOptions, statusLabel = t("testResults.status"), onClear, rightContent, showArchived, onShowArchivedChange, tags, selectedTagIds = [], onTagFilterChange }) => {
  const searchPlaceholder = placeholder || t("tableFilter.searchPlaceholder");
  const hasFilters = searchTerm.trim() !== "" || (statusFilter && statusFilter !== "all") || (selectedTagIds && selectedTagIds.length > 0);

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
    if (!statusFilter || statusFilter === "all") {
      return <span className="text-neutral-600 dark:text-neutral-400">Alle {statusLabel}</span>;
    }
    const option = statusOptions?.find((o) => o.value === statusFilter);
    if (option) {
      return <Badge variant={getVariantForStatus(option.value)}>{option.label}</Badge>;
    }
    return statusFilter;
  };

  return (
    <div className="flex items-center gap-3 mb-4 min-h-[36px]">
      <div className="relative max-w-md flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 pr-8 max-w-full"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X size={14} />
          </button>
        )}
      </div>

      {statusOptions && onStatusFilterChange && (
        <Select
          value={statusFilter || "all"}
          onValueChange={onStatusFilterChange}>
          <SelectTrigger className=" max-w-[160px]">{getSelectedStatusDisplay()}</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-neutral-600 dark:text-neutral-400">{t("tableFilter.allStatuses").replace("{status}", statusLabel)}</span>
            </SelectItem>
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}>
                <StatusBadge status={option.value}>{option.label}</StatusBadge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {tags && tags.length > 0 && onTagFilterChange && (
        <Select
          value={selectedTagIds.length > 0 ? "filtered" : "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onTagFilterChange([]);
            }
          }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue>
              {selectedTagIds.length > 0 ? (
                <span className="flex items-center gap-2">
                  <Tag size={14} />
                  {selectedTagIds.length} Tag{selectedTagIds.length !== 1 ? 's' : ''}
                </span>
              ) : (
                "Alle Tags"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem
                key={tag.id}
                value={tag.id.toString()}
                onSelect={() => {
                  if (selectedTagIds.includes(tag.id)) {
                    onTagFilterChange(selectedTagIds.filter(id => id !== tag.id));
                  } else {
                    onTagFilterChange([...selectedTagIds, tag.id]);
                  }
                }}>
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                    className="border text-xs">
                    {tag.name}
                  </Badge>
                  {selectedTagIds.includes(tag.id) && <span className="text-xs">✓</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onShowArchivedChange !== undefined && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived"
            checked={showArchived || false}
            onCheckedChange={(checked) => onShowArchivedChange(checked === true)}
          />
          <label
            htmlFor="show-archived"
            className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            {t("tableFilter.showArchived")}
          </label>
        </div>
      )}

      {hasFilters && onClear && (
        <button
          onClick={onClear}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
          {t("tableFilter.resetFilters")}
        </button>
      )}

      {/* Right content (e.g., selection actions) */}
      {rightContent && (
        <div className="ml-auto flex items-center">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default TableFilter;

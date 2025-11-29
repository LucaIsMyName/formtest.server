import { i as dist, j as jsxRuntimeExports, l as ChevronUp, m as ChevronDown, n as Select, o as SelectTrigger, p as SelectValue, q as SelectContent, s as SelectItem, a7 as Search, I as Input, X, r as reactExports } from "./index-g7SABpaB.js";
import { l as ChevronsUpDown, h as TableHead } from "./Table-Jt8OQyHB.js";
const SortableTableHead = (t0) => {
  const $ = dist.c(12);
  const {
    children,
    sortDirection,
    onSort,
    className: t1
  } = t0;
  const className = t1 === void 0 ? "" : t1;
  const isSortable = !!onSort;
  const t2 = `${className} ${isSortable ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" : ""}`;
  let t3;
  if ($[0] !== children) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children });
    $[0] = children;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  let t4;
  if ($[2] !== isSortable || $[3] !== sortDirection) {
    t4 = isSortable && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex", children: sortDirection === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 14, className: "text-blue-600 dark:text-blue-400" }) : sortDirection === "desc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, className: "text-blue-600 dark:text-blue-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { size: 14, className: "text-gray-400" }) });
    $[2] = isSortable;
    $[3] = sortDirection;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== t3 || $[6] !== t4) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      t3,
      t4
    ] });
    $[5] = t3;
    $[6] = t4;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== onSort || $[9] !== t2 || $[10] !== t5) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: t2, onClick: onSort, children: t5 });
    $[8] = onSort;
    $[9] = t2;
    $[10] = t5;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  return t6;
};
const TableFilter = (t0) => {
  const $ = dist.c(27);
  const {
    searchTerm,
    onSearchChange,
    placeholder: t1,
    statusFilter,
    onStatusFilterChange,
    statusOptions,
    onClear
  } = t0;
  const placeholder = t1 === void 0 ? "Suchen..." : t1;
  let t2;
  if ($[0] !== searchTerm || $[1] !== statusFilter) {
    t2 = searchTerm.trim() !== "" || statusFilter && statusFilter !== "all";
    $[0] = searchTerm;
    $[1] = statusFilter;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const hasFilters = t2;
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" });
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== onSearchChange) {
    t4 = (e) => onSearchChange(e.target.value);
    $[4] = onSearchChange;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== placeholder || $[7] !== searchTerm || $[8] !== t4) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: searchTerm, onChange: t4, placeholder, className: "pl-9 pr-8" });
    $[6] = placeholder;
    $[7] = searchTerm;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== onSearchChange || $[11] !== searchTerm) {
    t6 = searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSearchChange(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) });
    $[10] = onSearchChange;
    $[11] = searchTerm;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  let t7;
  if ($[13] !== t5 || $[14] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
      t3,
      t5,
      t6
    ] });
    $[13] = t5;
    $[14] = t6;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  let t8;
  if ($[16] !== onStatusFilterChange || $[17] !== statusFilter || $[18] !== statusOptions) {
    t8 = statusOptions && onStatusFilterChange && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter || "all", onValueChange: onStatusFilterChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle Status" }),
        statusOptions.map(_temp)
      ] })
    ] });
    $[16] = onStatusFilterChange;
    $[17] = statusFilter;
    $[18] = statusOptions;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  let t9;
  if ($[20] !== hasFilters || $[21] !== onClear) {
    t9 = hasFilters && onClear && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClear, className: "text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Filter zurücksetzen" });
    $[20] = hasFilters;
    $[21] = onClear;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  let t10;
  if ($[23] !== t7 || $[24] !== t8 || $[25] !== t9) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      t7,
      t8,
      t9
    ] });
    $[23] = t7;
    $[24] = t8;
    $[25] = t9;
    $[26] = t10;
  } else {
    t10 = $[26];
  }
  return t10;
};
function _temp(option) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: option.value, children: option.label }, option.value);
}
function useSortableData(items, t0, storageKey) {
  const $ = dist.c(24);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === void 0 ? {
      key: null,
      direction: null
    } : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const initialConfig = t1;
  let t2;
  if ($[2] !== initialConfig || $[3] !== storageKey) {
    t2 = () => {
      if (storageKey) {
        try {
          const stored = localStorage.getItem(`sort_${storageKey}`);
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (t32) {
          const e = t32;
          console.warn("Failed to load sort state from localStorage:", e);
        }
      }
      return initialConfig;
    };
    $[2] = initialConfig;
    $[3] = storageKey;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const getInitialState = t2;
  const [sortConfig, setSortConfig] = reactExports.useState(getInitialState);
  let t3;
  let t4;
  if ($[5] !== sortConfig || $[6] !== storageKey) {
    t3 = () => {
      if (storageKey) {
        try {
          localStorage.setItem(`sort_${storageKey}`, JSON.stringify(sortConfig));
        } catch (t52) {
          const e_0 = t52;
          console.warn("Failed to save sort state to localStorage:", e_0);
        }
      }
    };
    t4 = [sortConfig, storageKey];
    $[5] = sortConfig;
    $[6] = storageKey;
    $[7] = t3;
    $[8] = t4;
  } else {
    t3 = $[7];
    t4 = $[8];
  }
  reactExports.useEffect(t3, t4);
  let t5;
  bb0: {
    if (!sortConfig.key || !sortConfig.direction) {
      t5 = items;
      break bb0;
    }
    let t62;
    if ($[9] !== items || $[10] !== sortConfig.direction || $[11] !== sortConfig.key) {
      let t72;
      if ($[13] !== sortConfig.direction || $[14] !== sortConfig.key) {
        t72 = (a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue == null && bValue == null) {
            return 0;
          }
          if (aValue == null) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (bValue == null) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          if (typeof aValue === "string" && typeof bValue === "string") {
            const comparison = aValue.localeCompare(bValue, "de", {
              sensitivity: "base"
            });
            return sortConfig.direction === "asc" ? comparison : -comparison;
          }
          if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
          }
          if (typeof aValue === "string" && typeof bValue === "string") {
            const dateA = new Date(aValue).getTime();
            const dateB = new Date(bValue).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
              return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
            }
          }
          const comparison_0 = String(aValue).localeCompare(String(bValue));
          return sortConfig.direction === "asc" ? comparison_0 : -comparison_0;
        };
        $[13] = sortConfig.direction;
        $[14] = sortConfig.key;
        $[15] = t72;
      } else {
        t72 = $[15];
      }
      t62 = [...items].sort(t72);
      $[9] = items;
      $[10] = sortConfig.direction;
      $[11] = sortConfig.key;
      $[12] = t62;
    } else {
      t62 = $[12];
    }
    t5 = t62;
  }
  const sortedItems = t5;
  let t6;
  if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = (key) => {
      setSortConfig((current) => {
        if (current.key === key) {
          if (current.direction === "asc") {
            return {
              key,
              direction: "desc"
            };
          }
          if (current.direction === "desc") {
            return {
              key: null,
              direction: null
            };
          }
        }
        return {
          key,
          direction: "asc"
        };
      });
    };
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  const requestSort = t6;
  let t7;
  if ($[17] !== sortConfig.direction || $[18] !== sortConfig.key) {
    t7 = (key_0) => {
      if (sortConfig.key === key_0) {
        return sortConfig.direction;
      }
      return null;
    };
    $[17] = sortConfig.direction;
    $[18] = sortConfig.key;
    $[19] = t7;
  } else {
    t7 = $[19];
  }
  const getSortDirection = t7;
  let t8;
  if ($[20] !== getSortDirection || $[21] !== sortConfig || $[22] !== sortedItems) {
    t8 = {
      sortedItems,
      requestSort,
      sortConfig,
      getSortDirection
    };
    $[20] = getSortDirection;
    $[21] = sortConfig;
    $[22] = sortedItems;
    $[23] = t8;
  } else {
    t8 = $[23];
  }
  return t8;
}
function useFilterableData(items, searchableKeys, t0, storageKey) {
  const $ = dist.c(22);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === void 0 ? {
      searchTerm: "",
      statusFilter: void 0
    } : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const initialFilter = t1;
  let t2;
  if ($[2] !== initialFilter || $[3] !== storageKey) {
    t2 = () => {
      if (storageKey) {
        try {
          const stored = localStorage.getItem(`filter_${storageKey}`);
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (t32) {
          const e = t32;
          console.warn("Failed to load filter state from localStorage:", e);
        }
      }
      return initialFilter;
    };
    $[2] = initialFilter;
    $[3] = storageKey;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const getInitialState = t2;
  const [filterConfig, setFilterConfig] = reactExports.useState(getInitialState);
  let t3;
  let t4;
  if ($[5] !== filterConfig || $[6] !== storageKey) {
    t3 = () => {
      if (storageKey) {
        try {
          localStorage.setItem(`filter_${storageKey}`, JSON.stringify(filterConfig));
        } catch (t52) {
          const e_0 = t52;
          console.warn("Failed to save filter state to localStorage:", e_0);
        }
      }
    };
    t4 = [filterConfig, storageKey];
    $[5] = filterConfig;
    $[6] = storageKey;
    $[7] = t3;
    $[8] = t4;
  } else {
    t3 = $[7];
    t4 = $[8];
  }
  reactExports.useEffect(t3, t4);
  let result;
  if ($[9] !== filterConfig.searchTerm || $[10] !== filterConfig.statusFilter || $[11] !== items || $[12] !== searchableKeys) {
    result = items;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== "all") {
      let t52;
      if ($[14] !== filterConfig.statusFilter) {
        t52 = (item) => {
          const status = item.status;
          return status === filterConfig.statusFilter;
        };
        $[14] = filterConfig.statusFilter;
        $[15] = t52;
      } else {
        t52 = $[15];
      }
      result = result.filter(t52);
    }
    if (filterConfig.searchTerm.trim()) {
      const searchLower = filterConfig.searchTerm.toLowerCase().trim();
      result = result.filter((item_0) => searchableKeys.some((key) => {
        const value = item_0[key];
        if (value == null) {
          return false;
        }
        return String(value).toLowerCase().includes(searchLower);
      }));
    }
    $[9] = filterConfig.searchTerm;
    $[10] = filterConfig.statusFilter;
    $[11] = items;
    $[12] = searchableKeys;
    $[13] = result;
  } else {
    result = $[13];
  }
  const filteredItems = result;
  let t5;
  if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = (term) => {
      setFilterConfig((current) => ({
        ...current,
        searchTerm: term
      }));
    };
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  const setSearchTerm = t5;
  let t6;
  if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = (status_0) => {
      setFilterConfig((current_0) => ({
        ...current_0,
        statusFilter: status_0
      }));
    };
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  const setStatusFilter = t6;
  let t7;
  if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      setFilterConfig({
        searchTerm: "",
        statusFilter: void 0
      });
    };
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  const clearFilters = t7;
  let t8;
  if ($[19] !== filterConfig || $[20] !== filteredItems) {
    t8 = {
      filteredItems,
      filterConfig,
      setSearchTerm,
      setStatusFilter,
      clearFilters
    };
    $[19] = filterConfig;
    $[20] = filteredItems;
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  return t8;
}
export {
  SortableTableHead as S,
  TableFilter as T,
  useSortableData as a,
  useFilterableData as u
};

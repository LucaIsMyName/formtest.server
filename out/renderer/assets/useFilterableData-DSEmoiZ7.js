import { aC as Root, r as reactExports, i as dist, aD as cn, j as jsxRuntimeExports, aE as Portal, aF as Content, aG as Overlay, aH as Close, X, aI as Title, aJ as Description, v as ChevronUp, x as ChevronDown, aK as ChevronsUpDown, M as TableHead } from "./index-CFtKbJVz.js";
const Drawer = Root;
const DrawerPortal = Portal;
const DrawerOverlay = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(9);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
DrawerOverlay.displayName = "DrawerOverlay";
const DrawerContent = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(13);
  let children;
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      children,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = children;
    $[2] = className;
    $[3] = props;
  } else {
    children = $[1];
    className = $[2];
    props = $[3];
  }
  let t1;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerOverlay, {});
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== className) {
    t2 = cn("fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l border-gray-200 bg-white p-6 shadow-lg overflow-y-auto transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-full md:max-w-[800px] dark:border-gray-700 dark:bg-gray-800", className);
    $[5] = className;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] });
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  let t4;
  if ($[8] !== children || $[9] !== props || $[10] !== ref || $[11] !== t2) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerPortal, { children: [
      t1,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: t2, ...props, children: [
        children,
        t3
      ] })
    ] });
    $[8] = children;
    $[9] = props;
    $[10] = ref;
    $[11] = t2;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  return t4;
});
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = (t0) => {
  const $ = dist.c(8);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("flex flex-col space-y-2 text-center sm:text-left", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t1, ...props });
    $[5] = props;
    $[6] = t1;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  return t2;
};
DrawerHeader.displayName = "DrawerHeader";
const DrawerFooter = (t0) => {
  const $ = dist.c(8);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t1, ...props });
    $[5] = props;
    $[6] = t1;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  return t2;
};
DrawerFooter.displayName = "DrawerFooter";
const DrawerTitle = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(9);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-50", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
DrawerTitle.displayName = "DrawerTitle";
const DrawerDescription = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(9);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("text-sm text-gray-500 dark:text-gray-400", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
DrawerDescription.displayName = "DrawerDescription";
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
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block flex-1", children });
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
          const record = item;
          if ("status" in record) {
            return record.status === filterConfig.statusFilter;
          }
          if ("isActive" in record) {
            const isActive = record.isActive;
            if (filterConfig.statusFilter === "active") {
              return isActive === true;
            }
            if (filterConfig.statusFilter === "inactive") {
              return isActive === false;
            }
          }
          return true;
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
    t6 = (status) => {
      setFilterConfig((current_0) => ({
        ...current_0,
        statusFilter: status
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
  Drawer as D,
  SortableTableHead as S,
  DrawerContent as a,
  DrawerHeader as b,
  DrawerFooter as c,
  useSortableData as d,
  useFilterableData as u
};

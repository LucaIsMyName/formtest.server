import { i as dist, j as jsxRuntimeExports, aM as TriangleAlert, ay as DialogHeader, az as DialogTitle, aN as DialogDescription, B as Button, aO as DialogFooter, aB as DialogContent, aC as Dialog, y as Select, z as SelectTrigger, D as SelectContent, G as SelectItem, p as StatusBadge, aP as Badge, aA as Search, I as Input, X } from "./index-BmL3LNRX.js";
const DeleteConfirmDialog = (t0) => {
  const $ = dist.c(31);
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isLoading: t1
  } = t0;
  const isLoading = t1 === void 0 ? false : t1;
  let t2;
  if ($[0] !== isLoading || $[1] !== onClose) {
    t2 = (open) => !open && !isLoading && onClose();
    $[0] = isLoading;
    $[1] = onClose;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) });
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== title) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      t3,
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-lg", children: title })
    ] }) });
    $[4] = title;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== message) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-gray-600 dark:text-gray-400 text-base", children: message });
    $[6] = message;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== itemName) {
    t6 = itemName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-gray-900 dark:text-white mt-2", children: [
      '"',
      itemName,
      '"'
    ] });
    $[8] = itemName;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== t5 || $[11] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4", children: [
      t5,
      t6
    ] });
    $[10] = t5;
    $[11] = t6;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] !== isLoading || $[14] !== onClose) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, variant: "secondary", size: "md", disabled: isLoading, children: "Abbrechen" });
    $[13] = isLoading;
    $[14] = onClose;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  const t9 = isLoading ? "Löschen..." : "Löschen bestätigen";
  let t10;
  if ($[16] !== isLoading || $[17] !== onConfirm || $[18] !== t9) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onConfirm, variant: "danger", size: "md", isLoading, disabled: isLoading, children: t9 });
    $[16] = isLoading;
    $[17] = onConfirm;
    $[18] = t9;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] !== t10 || $[21] !== t8) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      t8,
      t10
    ] });
    $[20] = t10;
    $[21] = t8;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] !== t11 || $[24] !== t4 || $[25] !== t7) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[450px]", children: [
      t4,
      t7,
      t11
    ] });
    $[23] = t11;
    $[24] = t4;
    $[25] = t7;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  let t13;
  if ($[27] !== isOpen || $[28] !== t12 || $[29] !== t2) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: t2, children: t12 });
    $[27] = isOpen;
    $[28] = t12;
    $[29] = t2;
    $[30] = t13;
  } else {
    t13 = $[30];
  }
  return t13;
};
const TableFilter = (t0) => {
  const $ = dist.c(36);
  const {
    searchTerm,
    onSearchChange,
    placeholder: t1,
    statusFilter,
    onStatusFilterChange,
    statusOptions,
    statusLabel: t2,
    onClear,
    rightContent
  } = t0;
  const placeholder = t1 === void 0 ? "Suchen..." : t1;
  const statusLabel = t2 === void 0 ? "Status" : t2;
  let t3;
  if ($[0] !== searchTerm || $[1] !== statusFilter) {
    t3 = searchTerm.trim() !== "" || statusFilter && statusFilter !== "all";
    $[0] = searchTerm;
    $[1] = statusFilter;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const hasFilters = t3;
  const getVariantForStatus = _temp;
  let t4;
  if ($[3] !== statusFilter || $[4] !== statusLabel || $[5] !== statusOptions) {
    t4 = () => {
      if (!statusFilter || statusFilter === "all") {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [
          "Alle ",
          statusLabel
        ] });
      }
      const option = statusOptions?.find((o) => o.value === statusFilter);
      if (option) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: getVariantForStatus(option.value), children: option.label });
      }
      return statusFilter;
    };
    $[3] = statusFilter;
    $[4] = statusLabel;
    $[5] = statusOptions;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const getSelectedStatusDisplay = t4;
  let t5;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" });
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== onSearchChange) {
    t6 = (e) => onSearchChange(e.target.value);
    $[8] = onSearchChange;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== placeholder || $[11] !== searchTerm || $[12] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: searchTerm, onChange: t6, placeholder, className: "pl-9 pr-8 max-w-full" });
    $[10] = placeholder;
    $[11] = searchTerm;
    $[12] = t6;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  let t8;
  if ($[14] !== onSearchChange || $[15] !== searchTerm) {
    t8 = searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSearchChange(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) });
    $[14] = onSearchChange;
    $[15] = searchTerm;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== t7 || $[18] !== t8) {
    t9 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md flex-1", children: [
      t5,
      t7,
      t8
    ] });
    $[17] = t7;
    $[18] = t8;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  let t10;
  if ($[20] !== getSelectedStatusDisplay || $[21] !== onStatusFilterChange || $[22] !== statusFilter || $[23] !== statusLabel || $[24] !== statusOptions) {
    t10 = statusOptions && onStatusFilterChange && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter || "all", onValueChange: onStatusFilterChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: " max-w-[160px]", children: getSelectedStatusDisplay() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [
          "Alle ",
          statusLabel
        ] }) }),
        statusOptions.map(_temp2)
      ] })
    ] });
    $[20] = getSelectedStatusDisplay;
    $[21] = onStatusFilterChange;
    $[22] = statusFilter;
    $[23] = statusLabel;
    $[24] = statusOptions;
    $[25] = t10;
  } else {
    t10 = $[25];
  }
  let t11;
  if ($[26] !== hasFilters || $[27] !== onClear) {
    t11 = hasFilters && onClear && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClear, className: "text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Filter zurücksetzen" });
    $[26] = hasFilters;
    $[27] = onClear;
    $[28] = t11;
  } else {
    t11 = $[28];
  }
  let t12;
  if ($[29] !== rightContent) {
    t12 = rightContent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center", children: rightContent });
    $[29] = rightContent;
    $[30] = t12;
  } else {
    t12 = $[30];
  }
  let t13;
  if ($[31] !== t10 || $[32] !== t11 || $[33] !== t12 || $[34] !== t9) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      t9,
      t10,
      t11,
      t12
    ] });
    $[31] = t10;
    $[32] = t11;
    $[33] = t12;
    $[34] = t9;
    $[35] = t13;
  } else {
    t13 = $[35];
  }
  return t13;
};
function _temp(status) {
  switch (status.toUpperCase()) {
    case "SUCCESS":
    case "ACTIVE": {
      return "success";
    }
    case "FAILURE":
    case "ERROR": {
      return "error";
    }
    case "RUNNING": {
      return "running";
    }
    case "QUEUED": {
      return "queued";
    }
    case "STOPPED": {
      return "stopped";
    }
    case "INACTIVE": {
      return "inactive";
    }
    default: {
      return "default";
    }
  }
}
function _temp2(option_0) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: option_0.value, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: option_0.value, children: option_0.label }) }, option_0.value);
}
export {
  DeleteConfirmDialog as D,
  TableFilter as T
};

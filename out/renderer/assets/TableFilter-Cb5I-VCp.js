import { Z as createLucideIcon, i as dist, j as jsxRuntimeExports, ad as DialogHeader, ae as DialogTitle, ax as DialogDescription, B as Button, ay as DialogFooter, af as DialogContent, ag as Dialog, G as React, ap as cn, r as reactExports, a2 as ChevronLeft, A as ChevronRight, n as Select, o as SelectTrigger, q as SelectContent, s as SelectItem, v as StatusBadge, az as Badge, aa as Search, I as Input, X } from "./index-Dvu3stsk.js";
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$1);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
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
const Table = React.forwardRef((t0, ref) => {
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
    t1 = cn("w-full divide-y divide-gray-200 dark:divide-gray-700", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { ref, className: t1, ...props }) });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
Table.displayName = "Table";
const TableHeader = React.forwardRef((t0, ref) => {
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
    t1 = cn("border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef((t0, ref) => {
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
    t1 = cn("bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
TableBody.displayName = "TableBody";
const TableRow = React.forwardRef((t0, ref) => {
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
    t1 = cn("hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef((t0, ref) => {
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
    t1 = cn("px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("th", { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef((t0, ref) => {
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
    t1 = cn("select-normal px-4 py-3 whitespace-nowrap", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("td", { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
TableCell.displayName = "TableCell";
const TablePagination = (t0) => {
  const $ = dist.c(56);
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className
  } = t0;
  const [inputValue, setInputValue] = reactExports.useState(String(currentPage));
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = (e) => {
      setInputValue(e.target.value);
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const handleInputChange = t1;
  let t2;
  if ($[1] !== currentPage || $[2] !== inputValue || $[3] !== onPageChange || $[4] !== totalPages) {
    t2 = (e_0) => {
      if (e_0.key === "Enter") {
        const page = parseInt(inputValue, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          onPageChange(page);
        } else {
          setInputValue(String(currentPage));
        }
      }
    };
    $[1] = currentPage;
    $[2] = inputValue;
    $[3] = onPageChange;
    $[4] = totalPages;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const handleInputKeyDown = t2;
  let t3;
  if ($[6] !== currentPage) {
    t3 = () => {
      setInputValue(String(currentPage));
    };
    $[6] = currentPage;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const handleInputBlur = t3;
  let t4;
  let t5;
  if ($[8] !== currentPage) {
    t4 = () => {
      setInputValue(String(currentPage));
    };
    t5 = [currentPage];
    $[8] = currentPage;
    $[9] = t4;
    $[10] = t5;
  } else {
    t4 = $[9];
    t5 = $[10];
  }
  React.useEffect(t4, t5);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  if (totalPages <= 1) {
    return null;
  }
  let t6;
  if ($[11] !== className) {
    t6 = cn("flex items-center justify-between px-4 py-1 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800", className);
    $[11] = className;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  let t7;
  if ($[13] !== endItem || $[14] !== startItem || $[15] !== totalItems) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: [
      startItem,
      "–",
      endItem,
      " von ",
      totalItems
    ] });
    $[13] = endItem;
    $[14] = startItem;
    $[15] = totalItems;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  let t8;
  if ($[17] !== currentPage || $[18] !== onPageChange) {
    t8 = () => onPageChange(currentPage - 1);
    $[17] = currentPage;
    $[18] = onPageChange;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  const t9 = currentPage <= 1;
  const t10 = currentPage <= 1 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200";
  let t11;
  if ($[20] !== t10) {
    t11 = cn("p-1.5 rounded-md transition-colors", t10);
    $[20] = t10;
    $[21] = t11;
  } else {
    t11 = $[21];
  }
  let t12;
  if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 });
    $[22] = t12;
  } else {
    t12 = $[22];
  }
  let t13;
  if ($[23] !== t11 || $[24] !== t8 || $[25] !== t9) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: t8, disabled: t9, className: t11, title: "Vorherige Seite", children: t12 });
    $[23] = t11;
    $[24] = t8;
    $[25] = t9;
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  let t14;
  if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Seite" });
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  let t15;
  if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
    t15 = cn("w-10 px-1 py-1 text-center text-[10px] font-mono rounded border", "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600", "text-gray-700 dark:text-gray-200", "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500");
    $[28] = t15;
  } else {
    t15 = $[28];
  }
  let t16;
  if ($[29] !== handleInputBlur || $[30] !== handleInputKeyDown || $[31] !== inputValue) {
    t16 = /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: inputValue, onChange: handleInputChange, onKeyDown: handleInputKeyDown, onBlur: handleInputBlur, className: t15 });
    $[29] = handleInputBlur;
    $[30] = handleInputKeyDown;
    $[31] = inputValue;
    $[32] = t16;
  } else {
    t16 = $[32];
  }
  let t17;
  if ($[33] !== totalPages) {
    t17 = /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "von ",
      totalPages
    ] });
    $[33] = totalPages;
    $[34] = t17;
  } else {
    t17 = $[34];
  }
  let t18;
  if ($[35] !== t16 || $[36] !== t17) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: [
      t14,
      t16,
      t17
    ] });
    $[35] = t16;
    $[36] = t17;
    $[37] = t18;
  } else {
    t18 = $[37];
  }
  let t19;
  if ($[38] !== currentPage || $[39] !== onPageChange) {
    t19 = () => onPageChange(currentPage + 1);
    $[38] = currentPage;
    $[39] = onPageChange;
    $[40] = t19;
  } else {
    t19 = $[40];
  }
  const t20 = currentPage >= totalPages;
  const t21 = currentPage >= totalPages ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200";
  let t22;
  if ($[41] !== t21) {
    t22 = cn("p-1.5 rounded-md transition-colors", t21);
    $[41] = t21;
    $[42] = t22;
  } else {
    t22 = $[42];
  }
  let t23;
  if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
    t23 = /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 });
    $[43] = t23;
  } else {
    t23 = $[43];
  }
  let t24;
  if ($[44] !== t19 || $[45] !== t20 || $[46] !== t22) {
    t24 = /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: t19, disabled: t20, className: t22, title: "Nächste Seite", children: t23 });
    $[44] = t19;
    $[45] = t20;
    $[46] = t22;
    $[47] = t24;
  } else {
    t24 = $[47];
  }
  let t25;
  if ($[48] !== t13 || $[49] !== t18 || $[50] !== t24) {
    t25 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      t13,
      t18,
      t24
    ] });
    $[48] = t13;
    $[49] = t18;
    $[50] = t24;
    $[51] = t25;
  } else {
    t25 = $[51];
  }
  let t26;
  if ($[52] !== t25 || $[53] !== t6 || $[54] !== t7) {
    t26 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t6, children: [
      t7,
      t25
    ] });
    $[52] = t25;
    $[53] = t6;
    $[54] = t7;
    $[55] = t26;
  } else {
    t26 = $[55];
  }
  return t26;
};
TablePagination.displayName = "TablePagination";
const TableFilter = (t0) => {
  const $ = dist.c(33);
  const {
    searchTerm,
    onSearchChange,
    placeholder: t1,
    statusFilter,
    onStatusFilterChange,
    statusOptions,
    statusLabel: t2,
    onClear
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
  if ($[29] !== t10 || $[30] !== t11 || $[31] !== t9) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      t9,
      t10,
      t11
    ] });
    $[29] = t10;
    $[30] = t11;
    $[31] = t9;
    $[32] = t12;
  } else {
    t12 = $[32];
  }
  return t12;
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
  CircleAlert as C,
  DeleteConfirmDialog as D,
  TableFilter as T,
  Table as a,
  TableHeader as b,
  TableRow as c,
  TableHead as d,
  TableBody as e,
  TableCell as f,
  TablePagination as g,
  TriangleAlert as h
};

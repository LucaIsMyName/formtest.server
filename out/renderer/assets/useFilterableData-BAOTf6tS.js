import { ab as createLucideIcon, at as Root, r as reactExports, i as dist, Y as cn, j as jsxRuntimeExports, au as Portal, av as Content, aw as Title, ax as Overlay, ay as Close, X, az as Description, aA as React, ag as ChevronLeft, A as ChevronRight, l as ChevronUp, m as ChevronDown, n as Select, o as SelectTrigger, q as SelectContent, s as SelectItem, v as StatusBadge, aB as Badge, am as Search, I as Input } from "./index-CTw5_kAE.js";
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
const Bot = createLucideIcon("bot", __iconNode$4);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
];
const ChevronsUpDown = createLucideIcon("chevrons-up-down", __iconNode$3);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$2);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  [
    "path",
    { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }
  ],
  [
    "path",
    { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }
  ]
];
const FileBraces = createLucideIcon("file-braces", __iconNode$1);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode);
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
    t2 = cn("fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l border-gray-200 bg-white p-6 shadow-lg overflow-y-auto transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-full md:max-w-[678px] dark:border-gray-700 dark:bg-gray-800", className);
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
    t1 = cn("hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", className);
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
  const $ = dist.c(31);
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
  const getVariantForStatus = _temp;
  let t3;
  if ($[3] !== statusFilter || $[4] !== statusOptions) {
    t3 = () => {
      if (!statusFilter || statusFilter === "all") {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Alle Status" });
      }
      const option = statusOptions?.find((o) => o.value === statusFilter);
      if (option) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: getVariantForStatus(option.value), children: option.label });
      }
      return statusFilter;
    };
    $[3] = statusFilter;
    $[4] = statusOptions;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const getSelectedStatusDisplay = t3;
  let t4;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" });
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== onSearchChange) {
    t5 = (e) => onSearchChange(e.target.value);
    $[7] = onSearchChange;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== placeholder || $[10] !== searchTerm || $[11] !== t5) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: searchTerm, onChange: t5, placeholder, className: "pl-9 pr-8" });
    $[9] = placeholder;
    $[10] = searchTerm;
    $[11] = t5;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  let t7;
  if ($[13] !== onSearchChange || $[14] !== searchTerm) {
    t7 = searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSearchChange(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) });
    $[13] = onSearchChange;
    $[14] = searchTerm;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  let t8;
  if ($[16] !== t6 || $[17] !== t7) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
      t4,
      t6,
      t7
    ] });
    $[16] = t6;
    $[17] = t7;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  let t9;
  if ($[19] !== getSelectedStatusDisplay || $[20] !== onStatusFilterChange || $[21] !== statusFilter || $[22] !== statusOptions) {
    t9 = statusOptions && onStatusFilterChange && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter || "all", onValueChange: onStatusFilterChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: getSelectedStatusDisplay() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Alle Status" }) }),
        statusOptions.map(_temp2)
      ] })
    ] });
    $[19] = getSelectedStatusDisplay;
    $[20] = onStatusFilterChange;
    $[21] = statusFilter;
    $[22] = statusOptions;
    $[23] = t9;
  } else {
    t9 = $[23];
  }
  let t10;
  if ($[24] !== hasFilters || $[25] !== onClear) {
    t10 = hasFilters && onClear && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClear, className: "text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Filter zurücksetzen" });
    $[24] = hasFilters;
    $[25] = onClear;
    $[26] = t10;
  } else {
    t10 = $[26];
  }
  let t11;
  if ($[27] !== t10 || $[28] !== t8 || $[29] !== t9) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      t8,
      t9,
      t10
    ] });
    $[27] = t10;
    $[28] = t8;
    $[29] = t9;
    $[30] = t11;
  } else {
    t11 = $[30];
  }
  return t11;
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
  Bot as B,
  Copy as C,
  Drawer as D,
  FileBraces as F,
  SortableTableHead as S,
  TableFilter as T,
  DrawerContent as a,
  DrawerHeader as b,
  DrawerTitle as c,
  DrawerFooter as d,
  useSortableData as e,
  Table as f,
  TableHeader as g,
  TableRow as h,
  TableHead as i,
  TableBody as j,
  TableCell as k,
  TablePagination as l,
  Square as m,
  ChevronsUpDown as n,
  useFilterableData as u
};
